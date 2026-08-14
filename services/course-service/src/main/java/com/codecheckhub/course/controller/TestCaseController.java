package com.codecheckhub.course.controller;

import com.codecheckhub.course.dto.CreateTestCaseRequest;
import com.codecheckhub.course.entity.TestCase;
import com.codecheckhub.course.service.TestCaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/test-cases")
@RequiredArgsConstructor
public class TestCaseController {

    private final TestCaseService testCaseService;

    @GetMapping
    public ResponseEntity<List<TestCase>> getTestCases(
            @RequestParam UUID problemId,
            @RequestParam(defaultValue = "true") boolean isPublic) {
        return ResponseEntity.ok(testCaseService.getTestCasesByProblem(problemId, isPublic));
    }

    @PostMapping
    public ResponseEntity<TestCase> createTestCase(@RequestBody CreateTestCaseRequest request) {
        return ResponseEntity.ok(testCaseService.createTestCase(request));
    }
}
