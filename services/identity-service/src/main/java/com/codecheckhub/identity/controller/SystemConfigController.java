package com.codecheckhub.identity.controller;

import com.codecheckhub.identity.dto.response.ApiResponse;
import com.codecheckhub.identity.entity.SystemConfig;
import com.codecheckhub.identity.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SystemConfigController {
    private final SystemConfigService systemConfigService;

    @GetMapping
    @Operation(summary = "Get all system settings (Admin only)")
    public ResponseEntity<ApiResponse<List<SystemConfig>>> getConfigs(
            @RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role
    ) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }
        return ResponseEntity.ok(ApiResponse.success(systemConfigService.getAllConfigs(), "Success"));
    }

    @PutMapping
    @Operation(summary = "Update system setting (Admin only)")
    public ResponseEntity<ApiResponse<Void>> updateConfig(
            @RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role,
            @RequestBody Map<String, String> body
    ) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }
        for (Map.Entry<String, String> entry : body.entrySet()) {
            systemConfigService.updateConfig(entry.getKey(), entry.getValue());
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Settings updated"));
    }
}
