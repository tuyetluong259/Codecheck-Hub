package com.codecheckhub.course.controller;

import com.codecheckhub.course.dto.AnalyticsResponse;
import com.codecheckhub.course.dto.CreateCourseRequest;
import com.codecheckhub.course.dto.JoinClassRequest;
import com.codecheckhub.course.entity.Course;
import com.codecheckhub.course.service.CourseService;
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
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course management APIs")
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @Operation(summary = "Get all courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID")
    public ResponseEntity<Course> getCourseById(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new course (Teacher/Admin only)")
    public ResponseEntity<Course> createCourse(
            @RequestHeader("X-User-Id") String teacherId,
            @RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role,
            @RequestBody CreateCourseRequest request) {
        if (!"TEACHER".equals(role) && !"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only teachers or admins can create courses");
        }
        return ResponseEntity.ok(courseService.createCourse(request, UUID.fromString(teacherId)));
    }

    @PostMapping("/{courseId}/enroll")
    @Operation(summary = "Enroll a student into a course")
    public ResponseEntity<Void> enrollCourse(
            @RequestHeader("X-User-Id") String studentId,
            @PathVariable UUID courseId) {
        courseService.enrollStudent(courseId, UUID.fromString(studentId));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/join")
    @Operation(summary = "Join a course using a class code")
    public ResponseEntity<Void> joinCourse(
            @RequestHeader("X-User-Id") String studentId,
            @RequestBody JoinClassRequest request) {
        courseService.joinCourseByCode(request.getCode(), UUID.fromString(studentId));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/analytics")
    @Operation(summary = "Get course analytics")
    public ResponseEntity<AnalyticsResponse> getCourseAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getCourseAnalytics(id));
    }
}
