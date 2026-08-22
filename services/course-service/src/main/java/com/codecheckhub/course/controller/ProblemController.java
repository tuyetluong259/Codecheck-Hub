package com.codecheckhub.course.controller;

import com.codecheckhub.course.dto.CreateProblemRequest;
import com.codecheckhub.course.entity.Problem;
import com.codecheckhub.course.service.ProblemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
@Tag(name = "Problems", description = "Assignment/Problem management APIs")
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    @Operation(summary = "Get problems by course ID")
    public ResponseEntity<List<Problem>> getProblems(@RequestParam UUID courseId) {
        return ResponseEntity.ok(problemService.getProblemsByCourseId(courseId));
    }

    @GetMapping("/lecturer")
    @Operation(summary = "Get all problems for current lecturer")
    public ResponseEntity<List<Problem>> getLecturerProblems(@RequestHeader("X-User-Id") String teacherId) {
        return ResponseEntity.ok(problemService.getProblemsByTeacherId(UUID.fromString(teacherId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get problem by ID")
    public ResponseEntity<Problem> getProblemById(@PathVariable UUID id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new problem/assignment (Teacher/Admin only)")
    public ResponseEntity<Problem> createProblem(
            @RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role,
            @RequestBody CreateProblemRequest request) {
        if (!"TEACHER".equals(role) && !"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only teachers or admins can create problems");
        }
        return ResponseEntity.ok(problemService.createProblem(request));
    }
}
