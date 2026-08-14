package com.codecheckhub.submission.controller;

import com.codecheckhub.submission.dto.AnalyticsResponse;
import com.codecheckhub.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal/submissions")
@RequiredArgsConstructor
public class InternalSubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(@RequestBody List<UUID> problemIds) {
        return ResponseEntity.ok(submissionService.getAnalytics(problemIds));
    }
}
