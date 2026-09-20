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

    @GetMapping("/all")
    @Operation(summary = "Get all problems (Admin only)")
    public ResponseEntity<List<Problem>> getAllProblems(@RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role) {
        if (!"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can perform this action");
        }
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/student")
    @Operation(summary = "Get all problems for current student")
    public ResponseEntity<List<com.codecheckhub.course.dto.StudentProblemResponse>> getStudentProblems(@RequestHeader("X-User-Id") String studentId) {
        return ResponseEntity.ok(problemService.getProblemsByStudentId(UUID.fromString(studentId)));
    }

    @GetMapping("/student/course/{courseId}")
    @Operation(summary = "Get problems for current student by course ID")
    public ResponseEntity<List<com.codecheckhub.course.dto.StudentProblemResponse>> getStudentProblemsByCourse(
            @PathVariable UUID courseId,
            @RequestHeader("X-User-Id") String studentId) {
        List<com.codecheckhub.course.dto.StudentProblemResponse> allProblems = problemService.getProblemsByStudentId(UUID.fromString(studentId));
        List<Problem> courseProblems = problemService.getProblemsByCourseId(courseId);
        List<UUID> courseProblemIds = courseProblems.stream().map(Problem::getId).toList();
        
        List<com.codecheckhub.course.dto.StudentProblemResponse> filtered = allProblems.stream()
                .filter(p -> courseProblemIds.contains(p.getId()))
                .toList();
        return ResponseEntity.ok(filtered);
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

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing problem (Teacher/Admin only)")
    public ResponseEntity<Problem> updateProblem(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role,
            @RequestBody CreateProblemRequest request) {
        if (!"TEACHER".equals(role) && !"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only teachers or admins can update problems");
        }
        return ResponseEntity.ok(problemService.updateProblem(id, request));
    }

    @PutMapping("/{id}/publish")
    @Operation(summary = "Publish or unpublish a problem (Admin only)")
    public ResponseEntity<Problem> updateProblemPublishStatus(
            @PathVariable UUID id,
            @RequestParam boolean published,
            @RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role) {
        if (!"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can perform this action");
        }
        return ResponseEntity.ok(problemService.updateProblemPublishStatus(id, published));
    }
}
