package com.codecheckhub.submission.controller;

import com.codecheckhub.submission.entity.Submission;
import com.codecheckhub.submission.messaging.JudgeRequest;
import com.codecheckhub.submission.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@Tag(name = "Submissions", description = "Submission endpoints")
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    @Operation(summary = "Submit code for judging")
    public ResponseEntity<Submission> submit(@Valid @RequestBody SubmitRequest request) {
        Submission submission = submissionService.submit(
                request.getProblemId(),
                request.getStudentId(),
                request.getCode(),
                Submission.Language.valueOf(request.getLanguage()),
                request.getTestCases(),
                request.getTimeLimitMs(),
                request.getMemoryLimitMb()
        );
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get submission by ID")
    public ResponseEntity<Submission> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(submissionService.getById(id));
    }

    @GetMapping("/problem/{problemId}/student/{studentId}")
    @Operation(summary = "Get submissions for a problem by student")
    public ResponseEntity<List<Submission>> getByProblemAndStudent(
            @PathVariable UUID problemId, @PathVariable UUID studentId) {
        return ResponseEntity.ok(submissionService.getByProblemAndStudent(problemId, studentId));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "submission-service"));
    }

    @Data
    public static class SubmitRequest {
        private UUID problemId;
        private UUID studentId;
        private String code;
        private String language;
        private int timeLimitMs = 2000;
        private int memoryLimitMb = 256;
        private List<JudgeRequest.TestCaseData> testCases;
    }
}
