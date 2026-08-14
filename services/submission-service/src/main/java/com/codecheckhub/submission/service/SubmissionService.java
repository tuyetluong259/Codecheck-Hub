package com.codecheckhub.submission.service;

import com.codecheckhub.submission.entity.Submission;
import com.codecheckhub.submission.entity.SubmissionResult;
import com.codecheckhub.submission.messaging.JudgeRequest;
import com.codecheckhub.submission.messaging.JudgeResult;
import com.codecheckhub.submission.messaging.SubmissionProducer;
import com.codecheckhub.submission.repository.SubmissionRepository;
import com.codecheckhub.submission.repository.SubmissionResultRepository;
import com.codecheckhub.submission.repository.QualityReportRepository;
import com.codecheckhub.submission.entity.QualityReport;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.codecheckhub.submission.dto.AnalyticsResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository resultRepository;
    private final QualityReportRepository qualityReportRepository;
    private final SubmissionProducer producer;
    private final ObjectMapper objectMapper;

    @Transactional
    public Submission submit(UUID problemId, UUID studentId, String code,
                             Submission.Language language,
                             List<JudgeRequest.TestCaseData> testCases,
                             int timeLimitMs, int memoryLimitMb) {

        Submission submission = Submission.builder()
                .problemId(problemId)
                .studentId(studentId)
                .sourceCode(code)
                .language(language)
                .status(Submission.Status.PENDING)
                .build();
        submission = submissionRepository.save(submission);

        JudgeRequest request = JudgeRequest.builder()
                .submissionId(submission.getId())
                .problemId(problemId)
                .studentId(studentId)
                .sourceCode(code)
                .language(language.name())
                .timeLimitMs(timeLimitMs)
                .memoryLimitMb(memoryLimitMb)
                .testCases(testCases)
                .build();

        producer.sendToJudge(request);

        // BUG FIX: cập nhật status RUNNING sau khi enqueue thành công
        submission.setStatus(Submission.Status.RUNNING);
        submission = submissionRepository.save(submission);
        log.info("Submission {} queued for judging", submission.getId());

        return submission;
    }

    // BUG FIX: dùng REQUIRES_NEW để tránh transaction của outer context bị rollback
    // khi RabbitMQ listener chạy trong thread riêng
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    @RabbitListener(queues = "${rabbitmq.queue.result}")
    public void handleJudgeResult(JudgeResult result) {
        log.info("Received judge result for submission {}", result.getSubmissionId());

        Submission submission = submissionRepository.findById(result.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found: " + result.getSubmissionId()));

        submission.setStatus(Submission.Status.valueOf(result.getOverallStatus()));
        submission.setScore(result.getScore());
        submission.setPassedTestCases(result.getPassedCount());
        submission.setTotalTestCases(result.getTotalCount());
        submission.setCompileError(result.getCompileError());
        submission.setExecutionTime(result.getResults() != null ? result.getResults().stream().mapToLong(r -> r.getTimeMs() != null ? r.getTimeMs() : 0).max().orElse(0L) : 0L);
        submission.setMemoryUsed(result.getResults() != null ? result.getResults().stream().mapToLong(r -> r.getMemoryMb() != null ? r.getMemoryMb() : 0).max().orElse(0L) : 0L);
        submission.setJudgedAt(LocalDateTime.now());

        if (result.getResults() != null) {
            List<SubmissionResult> submissionResults = result.getResults().stream().map(r -> {
                // BUG FIX: null-safe status parsing — nếu status không hợp lệ default về RUNTIME_ERROR
                Submission.Status tcStatus;
                try {
                    tcStatus = Submission.Status.valueOf(r.getStatus());
                } catch (Exception e) {
                    tcStatus = Submission.Status.RUNTIME_ERROR;
                }
                return SubmissionResult.builder()
                        .submission(submission)
                        .testCaseId(r.getTestCaseId())
                        .status(tcStatus)
                        .timeMs(r.getTimeMs())
                        .memoryMb(r.getMemoryMb())
                        .actualOutput(r.getActualOutput())
                        .errorMessage(r.getErrorMessage())
                        .isHidden(r.isHidden())
                        .orderIndex(r.getOrderIndex())
                        .build();
            }).collect(Collectors.toList());

            // BUG FIX: dùng removeAll + addAll để tránh lỗi với orphanRemoval và detached entities
            submission.getResults().clear();
            submissionRepository.saveAndFlush(submission); // flush để orphanRemoval kích hoạt
            submission.getResults().addAll(submissionResults);
        }

        submissionRepository.save(submission);

        if ("ACCEPTED".equals(result.getOverallStatus()) && result.getSonarIssues() != null && !result.getSonarIssues().isEmpty()) {
            try {
                List<java.util.Map<String, String>> issues = objectMapper.readValue(result.getSonarIssues(), new TypeReference<>() {});
                int bugs = 0, smells = 0, vulnerabilities = 0;
                for (java.util.Map<String, String> issue : issues) {
                    String type = issue.get("type");
                    if ("BUG".equalsIgnoreCase(type)) bugs++;
                    else if ("CODE_SMELL".equalsIgnoreCase(type)) smells++;
                    else if ("VULNERABILITY".equalsIgnoreCase(type)) vulnerabilities++;
                }
                QualityReport report = QualityReport.builder()
                        .submission(submission)
                        .bugsCount(bugs)
                        .codeSmellsCount(smells)
                        .vulnerabilitiesCount(vulnerabilities)
                        .build();
                qualityReportRepository.save(report);
            } catch (Exception e) {
                log.warn("Failed to parse sonar issues for submission {}: {}", submission.getId(), e.getMessage());
            }
        }
    }

    public Submission getById(UUID id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    public List<Submission> getByProblemAndStudent(UUID problemId, UUID studentId) {
        return submissionRepository.findByProblemIdAndStudentIdOrderBySubmittedAtDesc(problemId, studentId);
    }

    public AnalyticsResponse getAnalytics(List<UUID> problemIds) {
        if (problemIds == null || problemIds.isEmpty()) {
            return AnalyticsResponse.builder().build();
        }
        
        List<Submission> submissions = submissionRepository.findByProblemIdIn(problemIds);
        if (submissions.isEmpty()) {
            return AnalyticsResponse.builder().build();
        }

        long totalSubmissions = submissions.size();
        long acceptedCount = submissions.stream()
                .filter(s -> Submission.Status.ACCEPTED.equals(s.getStatus()))
                .count();
        double acceptanceRate = (double) acceptedCount / totalSubmissions * 100;

        long uniqueStudents = submissions.stream()
                .map(Submission::getStudentId)
                .distinct()
                .count();
        double avgSubmissions = uniqueStudents > 0 ? (double) totalSubmissions / uniqueStudents : 0;

        List<UUID> submissionIds = submissions.stream()
                .map(Submission::getId)
                .collect(Collectors.toList());
        List<QualityReport> reports = qualityReportRepository.findBySubmissionIdIn(submissionIds);

        int bugs = reports.stream().mapToInt(QualityReport::getBugsCount).sum();
        int smells = reports.stream().mapToInt(QualityReport::getCodeSmellsCount).sum();
        int vulnerabilities = reports.stream().mapToInt(QualityReport::getVulnerabilitiesCount).sum();

        return AnalyticsResponse.builder()
                .acceptanceRate(acceptanceRate)
                .averageSubmissionsPerProblem(avgSubmissions)
                .totalBugs(bugs)
                .totalCodeSmells(smells)
                .totalVulnerabilities(vulnerabilities)
                .build();
    }
}
