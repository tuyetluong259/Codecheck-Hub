package com.codecheckhub.judge.messaging;

import com.codecheckhub.judge.service.DockerSandboxService;
import com.codecheckhub.judge.service.SonarQubeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JudgeConsumer {

    private final DockerSandboxService sandboxService;
    private final SonarQubeService sonarQubeService;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.result}")
    private String resultRoutingKey;

    @RabbitListener(queues = "${rabbitmq.queue.judge}")
    public void processJudgeRequest(JudgeRequest request) {
        log.info("Processing judge request for submission: {}", request.getSubmissionId());

        JudgeResult result;
        try {
            result = judge(request);
        } catch (Exception e) {
            log.error("Unhandled error while judging submission {}: ", request.getSubmissionId(), e);
            result = JudgeResult.builder()
                    .submissionId(request.getSubmissionId())
                    .studentId(request.getStudentId())
                    .overallStatus("SYSTEM_ERROR")
                    .score(0)
                    .passedCount(0)
                    .totalCount(request.getTestCases() != null ? request.getTestCases().size() : 0)
                    .compileError("System Error: " + e.getMessage())
                    .results(new ArrayList<>())
                    .build();
        }

        // Publish kết quả về result queue
        rabbitTemplate.convertAndSend(exchange, resultRoutingKey, result);
        log.info("Judge result published for submission: {} — Status: {}",
                request.getSubmissionId(), result.getOverallStatus());
    }

    private JudgeResult judge(JudgeRequest request) {
        List<JudgeResult.TestResult> testResults = new ArrayList<>();
        int passedCount = 0;
        int totalScore = 0;
        String compileError = null;
        String overallStatus = "ACCEPTED";

        // Bước 1: Kiểm tra compile (chạy với input rỗng, test case đầu tiên)
        if (request.getTestCases() != null && !request.getTestCases().isEmpty()) {
            JudgeRequest.TestCaseData firstCase = request.getTestCases().get(0);
            DockerSandboxService.SandboxResult compileTest = sandboxService.run(
                    request.getSourceCode(),
                    request.getLanguage(),
                    firstCase.getInput(),
                    request.getTimeLimitMs(),
                    request.getMemoryLimitMb());

            if (compileTest.getExitCode() != 0 &&
                    compileTest.getStderr().toLowerCase().contains("error:")) {
                compileError = compileTest.getStderr();
                overallStatus = "COMPILE_ERROR";

                return JudgeResult.builder()
                        .submissionId(request.getSubmissionId())
                        .studentId(request.getStudentId())
                        .overallStatus(overallStatus)
                        .score(0)
                        .passedCount(0)
                        .totalCount(request.getTestCases().size())
                        .compileError(compileError)
                        .results(testResults)
                        .build();
            }
        }

        // Bước 2: Chạy từng test case
        // BUG FIX: dùng index biến riêng thay vì indexOf() — indexOf() trả sai index
        // khi input trùng nhau
        List<JudgeRequest.TestCaseData> testCases = request.getTestCases();
        for (int idx = 0; idx < testCases.size(); idx++) {
            JudgeRequest.TestCaseData testCase = testCases.get(idx);
            DockerSandboxService.SandboxResult sandboxResult = sandboxService.run(
                    request.getSourceCode(),
                    request.getLanguage(),
                    testCase.getInput(),
                    request.getTimeLimitMs(),
                    request.getMemoryLimitMb());

            String status = determineStatus(sandboxResult, testCase.getExpectedOutput(),
                    request.getTimeLimitMs());

            if (status.equals("ACCEPTED")) {
                passedCount++;
                totalScore += testCase.getPoints();
            } else if (overallStatus.equals("ACCEPTED")) {
                // BUG FIX: chỉ cập nhật overallStatus nếu hiện tại vẫn là ACCEPTED (lấy lỗi đầu
                // tiên)
                overallStatus = status;
            }

            // BUG FIX: null-safe check cho stderr
            String stderr = sandboxResult.getStderr();
            String errorMsg = (stderr != null && !stderr.isEmpty()) ? stderr : null;

            testResults.add(JudgeResult.TestResult.builder()
                    .testCaseId(testCase.getId())
                    .status(status)
                    .timeMs(sandboxResult.getTimeMs())
                    .memoryMb(sandboxResult.getMemoryMb())
                    .actualOutput(!testCase.isHidden() ? sandboxResult.getStdout() : null)
                    .errorMessage(errorMsg)
                    .isHidden(testCase.isHidden())
                    .orderIndex(idx) // BUG FIX: dùng idx thay vì indexOf()
                    .build());
        }

        // Nếu tất cả pass → ACCEPTED, ngược lại giữ status lỗi đầu tiên
        if (passedCount == request.getTestCases().size()) {
            overallStatus = "ACCEPTED";
        }

        // Bước 3: SonarQube code review
        String sonarIssues = null;
        try {
            List<Map<String, String>> issues = sonarQubeService.simpleCodeReview(
                    request.getSourceCode(), request.getLanguage());
            sonarIssues = objectMapper.writeValueAsString(issues);
        } catch (Exception e) {
            log.warn("Code review failed: {}", e.getMessage());
        }

        return JudgeResult.builder()
                .submissionId(request.getSubmissionId())
                .studentId(request.getStudentId())
                .overallStatus(overallStatus)
                .score(totalScore)
                .passedCount(passedCount)
                .totalCount(request.getTestCases().size())
                .compileError(compileError)
                .sonarIssues(sonarIssues)
                .results(testResults)
                .build();
    }

    private String determineStatus(DockerSandboxService.SandboxResult result,
            String expected, int timeLimitMs) {
        if (result.isTimedOut() || result.getTimeMs() > timeLimitMs) {
            return "TIME_LIMIT";
        }
        if (result.getExitCode() != 0) {
            if (result.getStderr().contains("MemoryError") ||
                    result.getStderr().contains("bad_alloc")) {
                return "MEMORY_LIMIT";
            }
            return "RUNTIME_ERROR";
        }

        String actualOutput = result.getStdout().trim();
        String expectedOutput = expected.trim();

        return actualOutput.equals(expectedOutput) ? "ACCEPTED" : "WRONG_ANSWER";
    }
}
