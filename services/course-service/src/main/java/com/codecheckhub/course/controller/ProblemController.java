package com.codecheckhub.course.controller;

import com.codecheckhub.course.dto.CreateProblemRequest;
import com.codecheckhub.course.entity.Problem;
import com.codecheckhub.course.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public ResponseEntity<List<Problem>> getProblems(@RequestParam UUID courseId) {
        return ResponseEntity.ok(problemService.getProblemsByCourseId(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable UUID id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PostMapping
    public ResponseEntity<Problem> createProblem(@RequestBody CreateProblemRequest request) {
        return ResponseEntity.ok(problemService.createProblem(request));
    }
}
