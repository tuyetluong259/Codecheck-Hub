package com.codecheckhub.course.controller;

import com.codecheckhub.course.dto.AnalyticsResponse;
import com.codecheckhub.course.dto.CourseResponse;
import com.codecheckhub.course.dto.DashboardStatsResponse;
import com.codecheckhub.course.dto.CreateCourseRequest;
import com.codecheckhub.course.dto.JoinClassRequest;
import com.codecheckhub.course.dto.UserResponse;
import com.codecheckhub.course.dto.ApiResponse;
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
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/lecturer")
    @Operation(summary = "Get courses for current lecturer")
    public ResponseEntity<List<CourseResponse>> getLecturerCourses(@RequestHeader("X-User-Id") String teacherId) {
        return ResponseEntity.ok(courseService.getCoursesByTeacherId(UUID.fromString(teacherId)));
    }

    @GetMapping("/student")
    @Operation(summary = "Get courses for current student")
    public ResponseEntity<List<CourseResponse>> getStudentCourses(@RequestHeader("X-User-Id") String studentId) {
        return ResponseEntity.ok(courseService.getCoursesByStudentId(UUID.fromString(studentId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get course members")
    public ResponseEntity<List<UserResponse>> getCourseMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getCourseMembers(id));
    }

    @PostMapping
    @Operation(summary = "Create a new course (Teacher/Admin only)")
    public ResponseEntity<CourseResponse> createCourse(
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

    @GetMapping("/lecturer/dashboard-stats")
    @Operation(summary = "Get dashboard stats for current lecturer")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(@RequestHeader("X-User-Id") String teacherId) {
        return ResponseEntity.ok(courseService.getDashboardStats(UUID.fromString(teacherId)));
    }

    @GetMapping("/student/dashboard-stats")
    @Operation(summary = "Get dashboard stats for current student")
    public ResponseEntity<DashboardStatsResponse> getStudentDashboardStats(@RequestHeader("X-User-Id") String studentId) {
        return ResponseEntity.ok(courseService.getStudentDashboardStats(UUID.fromString(studentId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update course settings")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable UUID id,
            @RequestBody com.codecheckhub.course.dto.UpdateCourseRequest request
    ) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    @PostMapping(value = "/{id}/import-members", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import members via CSV/Excel")
    public ResponseEntity<ApiResponse<Integer>> importMembers(
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        int added = courseService.importMembers(id, file);
        return ResponseEntity.ok(new ApiResponse<>(true, added, "Imported " + added + " members"));
    }

}
