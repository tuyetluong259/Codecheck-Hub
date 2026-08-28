package com.codecheckhub.identity.controller;

import com.codecheckhub.identity.dto.response.ApiResponse;
import com.codecheckhub.identity.entity.AuditLog;
import com.codecheckhub.identity.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get all audit logs (Admin only)")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getLogs(
            @RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role
    ) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getLogs(), "Success"));
    }
}
