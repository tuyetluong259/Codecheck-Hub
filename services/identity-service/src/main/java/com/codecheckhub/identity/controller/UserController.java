package com.codecheckhub.identity.controller;

import com.codecheckhub.identity.dto.response.ApiResponse;
import com.codecheckhub.identity.dto.response.UserResponse;
import com.codecheckhub.identity.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(Authentication authentication) {
        UserResponse user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(user, "Success"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable UUID id) {
        UserResponse user = userService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(user, "Success"));
    }

    @GetMapping
    @Operation(summary = "Get all users (Admin only)")
    public ResponseEntity<ApiResponse<java.util.List<UserResponse>>> getAllUsers(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only admins can perform this action"));
        }
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(), "Success"));
    }

    @PostMapping("/batch")
    @Operation(summary = "Get multiple users by IDs")
    public ResponseEntity<ApiResponse<java.util.List<UserResponse>>> getUsersBatch(@RequestBody java.util.List<UUID> ids) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUsersBatch(ids), "Success"));
    }

    @PostMapping
    @Operation(summary = "Create user (Admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only admins can perform this action"));
        }
        UserResponse user = userService.createUser(
                body.get("username"),
                body.get("email"),
                body.get("fullName"),
                body.get("role"),
                body.get("password")
        );
        return ResponseEntity.ok(ApiResponse.success(user, "User created"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only admins can perform this action"));
        }
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted"));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateMe(
            Authentication authentication,
            @RequestBody Map<String, String> body
    ) {
        UserResponse user = userService.updateProfile(
                authentication.getName(),
                body.get("fullName"),
                body.get("avatarUrl")
        );
        return ResponseEntity.ok(ApiResponse.success(user, "Profile updated"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Lock/Unlock user (Admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> toggleStatus(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only admins can perform this action"));
        }
        UserResponse user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success(user, "User status updated"));
    }

    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import users from CSV/Excel (Admin only)")
    public ResponseEntity<ApiResponse<Integer>> importUsers(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only admins can perform this action"));
        }
        int count = userService.importUsers(file);
        return ResponseEntity.ok(ApiResponse.success(count, "Successfully imported " + count + " users"));
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
    }

    @PostMapping("/internal/sync-students")
    @Operation(summary = "Internal API to sync students from Course Service")
    public ResponseEntity<ApiResponse<java.util.List<UUID>>> syncStudents(
            @RequestBody java.util.List<com.codecheckhub.identity.dto.request.SyncStudentRequest> students
    ) {
        // Internal endpoint called by course-service with Lecturer's JWT
        return ResponseEntity.ok(ApiResponse.success(userService.syncStudents(students), "Successfully synced students"));
    }
}
