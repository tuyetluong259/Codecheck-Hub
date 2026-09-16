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
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;
import com.codecheckhub.submission.dto.AnalyticsResponse;
import com.codecheckhub.submission.dto.CompareResponse;
import com.codecheckhub.submission.dto.StudentStatsResponse;
import com.codecheckhub.submission.dto.GradebookEntryResponse;
import com.codecheckhub.submission.dto.PlagiarismResponse;
import com.codecheckhub.submission.dto.UserResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository resultRepository;
    private final QualityReportRepository qualityReportRepository;
    private final SubmissionProducer producer;
    private final ObjectMapper objectMapper;
    private final PlagiarismService plagiarismService;
    private final com.codecheckhub.submission.messaging.NotificationProducer notificationProducer;
    private final RestTemplate restTemplate;

    private HttpEntity<?> createAuthEntity() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        HttpHeaders headers = new HttpHeaders();
        if (authHeader != null) {
            headers.set(HttpHeaders.AUTHORIZATION, authHeader);
        }
        return new HttpEntity<>(headers);
    }

    @Transactional
    public Submission submit(UUID problemId, UUID studentId, String code,
                             Submission.Language language,
                             List<JudgeRequest.TestCaseData> testCases,
                             int timeLimitMs, int memoryLimitMb, boolean isSubmit) {

        Submission submission = Submission.builder()
                .id(UUID.randomUUID()) // Always generate an ID for tracking
                .problemId(problemId)
                .studentId(studentId)
                .sourceCode(code)
                .language(language)
                .status(Submission.Status.PENDING)
                .submittedAt(LocalDateTime.now())
                .build();
        
        if (isSubmit) {
            submission = submissionRepository.save(submission);
        }

        JudgeRequest request = JudgeRequest.builder()
                .submissionId(submission.getId())
                .problemId(problemId)
                .studentId(studentId)
                .sourceCode(code)
                .language(language.name())
                .timeLimitMs(timeLimitMs)
                .memoryLimitMb(memoryLimitMb)
                .isSubmit(isSubmit)
                .testCases(testCases)
                .build();

        producer.sendToJudge(request);

        if (isSubmit) {
            submission.setStatus(Submission.Status.RUNNING);
            submission = submissionRepository.save(submission);
            log.info("Submission {} queued for judging", submission.getId());
        } else {
            log.info("Test run {} queued for judging", submission.getId());
        }

        return submission;
    }

    // BUG FIX: dùng REQUIRES_NEW để tránh transaction của outer context bị rollback
    // khi RabbitMQ listener chạy trong thread riêng
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    @RabbitListener(queues = "${rabbitmq.queue.result}")
    public void handleJudgeResult(JudgeResult result) {
        log.info("Received judge result for submission {}", result.getSubmissionId());

        if (!result.isSubmit()) {
            // Test run mode: do not interact with DB, just send notification
            Map<String, Object> notificationPayload = new java.util.HashMap<>();
            notificationPayload.put("submissionId", result.getSubmissionId().toString());
            notificationPayload.put("studentId", result.getStudentId() != null ? result.getStudentId().toString() : "");
            notificationPayload.put("status", "TEST_RUN");
            notificationPayload.put("overallStatus", result.getOverallStatus());
            notificationPayload.put("passedCases", result.getPassedCount());
            notificationPayload.put("totalCases", result.getTotalCount());
            
            long maxTime = result.getResults() != null ? result.getResults().stream().mapToLong(r -> r.getTimeMs() != null ? r.getTimeMs() : 0).max().orElse(0L) : 0L;
            long maxMemory = result.getResults() != null ? result.getResults().stream().mapToLong(r -> r.getMemoryMb() != null ? r.getMemoryMb() : 0).max().orElse(0L) : 0L;
            
            notificationPayload.put("memoryConsumed", maxMemory);
            notificationPayload.put("executionTime", maxTime);
            if (result.getCompileError() != null) {
                notificationPayload.put("errorDetails", result.getCompileError());
            }
            notificationPayload.put("testResults", result.getResults());
            
            notificationProducer.sendNotification(notificationPayload);
            return;
        }

        Submission submission = submissionRepository.findById(result.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found: " + result.getSubmissionId()));

        Submission.Status overallStatus;
        try {
            overallStatus = Submission.Status.valueOf(result.getOverallStatus());
        } catch (Exception e) {
            overallStatus = Submission.Status.SYSTEM_ERROR;
        }
        submission.setStatus(overallStatus);
        submission.setScore(result.getScore());
        submission.setPassedTestCases(result.getPassedCount());
        submission.setTotalTestCases(result.getTotalCount());
        submission.setCompileError(result.getCompileError());
        submission.setExecutionTime(result.getResults() != null ? result.getResults().stream().mapToLong(r -> r.getTimeMs() != null ? r.getTimeMs() : 0).max().orElse(0L) : 0L);
        submission.setMemoryUsed(result.getResults() != null ? result.getResults().stream().mapToLong(r -> r.getMemoryMb() != null ? r.getMemoryMb() : 0).max().orElse(0L) : 0L);
        submission.setJudgedAt(LocalDateTime.now());

        if (result.getResults() != null) {
            List<SubmissionResult> submissionResults = result.getResults().stream().map(r -> {
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

            submission.getResults().clear();
            submissionRepository.saveAndFlush(submission);
            submission.getResults().addAll(submissionResults);
        }

        submissionRepository.save(submission);

        if ("ACCEPTED".equals(result.getOverallStatus())) {
            try {
                plagiarismService.checkPlagiarism(submission);
                submissionRepository.save(submission);
            } catch (Exception e) {
                log.error("Plagiarism check failed for submission {}", submission.getId(), e);
            }

        // Tạo payload notification gửi sang frontend
        Map<String, Object> notificationPayload = new java.util.HashMap<>();
        notificationPayload.put("submissionId", submission.getId().toString());
        notificationPayload.put("studentId", submission.getStudentId().toString());
        notificationPayload.put("problemId", submission.getProblemId().toString());
        notificationPayload.put("status", submission.getStatus().name());
        notificationPayload.put("score", submission.getScore());
        
        notificationPayload.put("overallStatus", result.getOverallStatus());
        notificationPayload.put("passedCases", result.getPassedCount());
        notificationPayload.put("totalCases", result.getTotalCount());
        notificationPayload.put("memoryConsumed", submission.getMemoryUsed());
        notificationPayload.put("executionTime", submission.getExecutionTime());
        
        if (result.getCompileError() != null) {
            notificationPayload.put("errorDetails", result.getCompileError());
        }

        int sonarScore = 100;
        if (result.getSonarIssues() != null && !result.getSonarIssues().isEmpty()) {
            try {
                List<java.util.Map<String, String>> issues = objectMapper.readValue(result.getSonarIssues(), new TypeReference<>() {});
                int bugs = 0, smells = 0, vulnerabilities = 0;
                for (java.util.Map<String, String> issue : issues) {
                    String type = issue.get("type");
                    if ("BUG".equalsIgnoreCase(type)) bugs++;
                    else if ("CODE_SMELL".equalsIgnoreCase(type)) smells++;
                    else if ("VULNERABILITY".equalsIgnoreCase(type)) vulnerabilities++;
                }
                sonarScore = Math.max(0, 100 - (bugs * 5) - (smells * 2));
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
        
        notificationPayload.put("sonarScore", sonarScore);
        
        notificationProducer.sendNotification(notificationPayload);
    }
    }

    public Submission getById(UUID id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    public List<Submission> getByProblemAndStudent(UUID problemId, UUID studentId) {
        return submissionRepository.findByProblemIdAndStudentIdOrderBySubmittedAtDesc(problemId, studentId);
    }

    private UserResponse getUserInfo(UUID userId) {
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "http://identity-service:8081/api/users/" + userId,
                    HttpMethod.GET,
                    createAuthEntity(),
                    String.class
            );
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(response.getBody());
            com.fasterxml.jackson.databind.JsonNode data = root.get("data");
            if (data != null && !data.isNull()) {
                return objectMapper.treeToValue(data, UserResponse.class);
            }
            return null;
        } catch (Exception e) {
            log.error("Failed to fetch user info for {}: {}", userId, e.getMessage());
            return null;
        }
    }

    public List<GradebookEntryResponse> getGradebook(UUID problemId) {
        List<Submission> allSubmissions = submissionRepository.findByProblemIdOrderBySubmittedAtDesc(problemId);
        Map<UUID, Submission> latestPerStudent = new java.util.LinkedHashMap<>();
        for (Submission s : allSubmissions) {
            if (!latestPerStudent.containsKey(s.getStudentId())) {
                latestPerStudent.put(s.getStudentId(), s);
            }
        }
        
        return latestPerStudent.values().stream().map(sub -> {
            UserResponse user = getUserInfo(sub.getStudentId());
            return GradebookEntryResponse.builder()
                    .submission(sub)
                    .studentName(user != null ? user.getFullName() : "Unknown")
                    .studentCode(user != null ? user.getStudentId() : sub.getStudentId().toString())
                    .build();
        }).collect(Collectors.toList());
    }

    public List<PlagiarismResponse> getSuspiciousSubmissions(UUID problemId, double threshold) {
        return submissionRepository.findByProblemIdOrderBySubmittedAtDesc(problemId)
                .stream()
                .filter(s -> s.getPlagiarismScore() != null && s.getPlagiarismScore() >= threshold)
                .map(sub -> {
                    UserResponse user = getUserInfo(sub.getStudentId());
                    UserResponse matchedUser = sub.getPlagiarismMatchedSubmissionId() != null 
                        ? getUserInfo(getById(sub.getPlagiarismMatchedSubmissionId()).getStudentId()) 
                        : null;
                        
                    return PlagiarismResponse.builder()
                            .submission(sub)
                            .studentName(user != null ? user.getFullName() : "Unknown")
                            .studentCode(user != null ? user.getStudentId() : sub.getStudentId().toString())
                            .matchedStudentName(matchedUser != null ? matchedUser.getFullName() : "Unknown")
                            .matchedStudentCode(matchedUser != null ? matchedUser.getStudentId() : (sub.getPlagiarismMatchedSubmissionId() != null ? sub.getPlagiarismMatchedSubmissionId().toString() : ""))
                            .build();
                })
                .collect(Collectors.toList());
    }

    public Submission applyPenalty(UUID submissionId, String action) {
        Submission submission = getById(submissionId);
        if ("PENALIZE".equalsIgnoreCase(action)) {
            submission.setStatus(Submission.Status.PENALIZED);
            submission.setScore(0);
        } else if ("EXCUSE".equalsIgnoreCase(action)) {
            submission.setStatus(Submission.Status.EXCUSED);
        } else {
            throw new IllegalArgumentException("Invalid action. Must be PENALIZE or EXCUSE.");
        }
        return submissionRepository.save(submission);
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

    public CompareResponse compareSubmissions(UUID sub1Id, UUID sub2Id) {
        Submission sub1 = getById(sub1Id);
        Submission sub2 = getById(sub2Id);
        
        // Actually, we should find which one matched which or just return their scores.
        // For simplicity, we just return the codes and the highest plagiarism score of the two.
        Double score = 0.0;
        if (sub1.getPlagiarismScore() != null) score = Math.max(score, sub1.getPlagiarismScore());
        if (sub2.getPlagiarismScore() != null) score = Math.max(score, sub2.getPlagiarismScore());
        
        return CompareResponse.builder()
                .student1Id(sub1.getStudentId())
                .code1(sub1.getSourceCode())
                .student2Id(sub2.getStudentId())
                .code2(sub2.getSourceCode())
                .plagiarismScore(score)
                .build();
    }

    public List<Submission> getStudentHistory(UUID studentId) {
        return submissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
    }

    public java.util.Map<UUID, String> getStudentProblemStatuses(UUID studentId) {
        List<Submission> history = submissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
        java.util.Map<UUID, String> statuses = new java.util.HashMap<>();
        for (Submission sub : history) {
            // Because it's ordered by desc, the first status we see is the latest for that problem
            if (!statuses.containsKey(sub.getProblemId())) {
                statuses.put(sub.getProblemId(), sub.getStatus().name());
            } else {
                // If it's ACCEPTED, we should keep ACCEPTED even if a later one failed (or depending on logic)
                // usually we just want the highest status. Let's say if it ever was ACCEPTED, keep it.
                if ("ACCEPTED".equals(sub.getStatus().name())) {
                    statuses.put(sub.getProblemId(), "ACCEPTED");
                }
            }
        }
        return statuses;
    }

    public StudentStatsResponse getStudentStats(UUID studentId) {
        List<Submission> submissions = submissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
        if (submissions.isEmpty()) {
            return StudentStatsResponse.builder().build();
        }

        long total = submissions.size();
        long accepted = submissions.stream().filter(s -> Submission.Status.ACCEPTED.equals(s.getStatus())).count();
        long failed = submissions.stream().filter(s -> 
            Submission.Status.WRONG_ANSWER.equals(s.getStatus()) || 
            Submission.Status.RUNTIME_ERROR.equals(s.getStatus()) || 
            Submission.Status.TIME_LIMIT.equals(s.getStatus()) || 
            Submission.Status.MEMORY_LIMIT.equals(s.getStatus()) ||
            Submission.Status.COMPILE_ERROR.equals(s.getStatus())
        ).count();
        long pending = submissions.stream().filter(s -> 
            Submission.Status.PENDING.equals(s.getStatus()) || 
            Submission.Status.RUNNING.equals(s.getStatus())
        ).count();
        long other = total - accepted - failed - pending;
        double rate = (double) accepted / total * 100;

        long problemsSolved = submissions.stream()
                .filter(s -> Submission.Status.ACCEPTED.equals(s.getStatus()))
                .map(Submission::getProblemId)
                .distinct()
                .count();

        // Calculate average clean code score (if any)
        List<UUID> subIds = submissions.stream().map(Submission::getId).collect(Collectors.toList());
        List<QualityReport> reports = qualityReportRepository.findBySubmissionIdIn(subIds);
        
        // Mock clean code score as 100 - (bugs*5 + smells*2)
        int totalScore = 0;
        int count = 0;
        for (QualityReport report : reports) {
            int score = 100 - (report.getBugsCount() * 5) - (report.getCodeSmellsCount() * 2);
            if (score < 0) score = 0;
            totalScore += score;
            count++;
        }
        int avgCleanCode = count > 0 ? totalScore / count : 100;

        return StudentStatsResponse.builder()
                .totalSubmissions(total)
                .acceptedCount(accepted)
                .failedCount(failed)
                .pendingCount(pending)
                .otherCount(other)
                .acceptanceRate(rate)
                .averageCleanCodeScore(avgCleanCode)
                .totalProblemsSolved(problemsSolved)
                .build();
    }

    public List<Submission> getRecentSubmissions(List<UUID> problemIds) {
        if (problemIds == null || problemIds.isEmpty()) {
            return new ArrayList<>();
        }
        return submissionRepository.findTop10ByProblemIdInOrderBySubmittedAtDesc(problemIds);
    }
}
