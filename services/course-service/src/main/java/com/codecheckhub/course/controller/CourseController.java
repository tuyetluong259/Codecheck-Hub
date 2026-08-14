package com.codecheckhub.course.controller;

import com.codecheckhub.course.dto.AnalyticsResponse;
import com.codecheckhub.course.dto.CreateCourseRequest;
import com.codecheckhub.course.dto.JoinClassRequest;
import com.codecheckhub.course.entity.Course;
import com.codecheckhub.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(
            @RequestHeader("X-User-Id") String teacherId,
            @RequestBody CreateCourseRequest request) {
        return ResponseEntity.ok(courseService.createCourse(request, UUID.fromString(teacherId)));
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<Void> enrollCourse(
            @RequestHeader("X-User-Id") String studentId,
            @PathVariable UUID courseId) {
        courseService.enrollStudent(courseId, UUID.fromString(studentId));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/join")
    public ResponseEntity<Void> joinCourse(
            @RequestHeader("X-User-Id") String studentId,
            @RequestBody JoinClassRequest request) {
        courseService.joinCourseByCode(request.getCode(), UUID.fromString(studentId));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<AnalyticsResponse> getCourseAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getCourseAnalytics(id));
    }
}
