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
            @RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role
    ) {
        if (!"ADMIN".equals(role)) {
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
            @RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role
    ) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only admins can perform this action"));
        }
        int count = userService.importUsers(file);
        return ResponseEntity.ok(ApiResponse.success(count, "Successfully imported " + count + " users"));
    }
}
