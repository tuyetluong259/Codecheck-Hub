package com.codecheckhub.identity.controller;

import com.codecheckhub.identity.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.ThreadMXBean;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system/metrics")
public class SystemMetricsController {

    @GetMapping
    @Operation(summary = "Get system metrics (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetrics(
            @RequestHeader(value = "X-User-Role", defaultValue = "STUDENT") String role
    ) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }

        Map<String, Object> metrics = new HashMap<>();

        // JVM Memory
        long maxMemory = Runtime.getRuntime().maxMemory();
        long totalMemory = Runtime.getRuntime().totalMemory();
        long freeMemory = Runtime.getRuntime().freeMemory();
        long usedMemory = totalMemory - freeMemory;

        metrics.put("jvm.memory.max", maxMemory);
        metrics.put("jvm.memory.total", totalMemory);
        metrics.put("jvm.memory.used", usedMemory);
        metrics.put("jvm.memory.free", freeMemory);

        // Threads
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        metrics.put("jvm.threads.count", threadBean.getThreadCount());
        metrics.put("jvm.threads.peak", threadBean.getPeakThreadCount());

        // OS
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        metrics.put("os.arch", osBean.getArch());
        metrics.put("os.name", osBean.getName());
        metrics.put("os.version", osBean.getVersion());
        metrics.put("os.processors", osBean.getAvailableProcessors());

        // Uptime
        long uptime = ManagementFactory.getRuntimeMXBean().getUptime();
        metrics.put("jvm.uptime", uptime);

        return ResponseEntity.ok(ApiResponse.success(metrics, "Success"));
    }
}
