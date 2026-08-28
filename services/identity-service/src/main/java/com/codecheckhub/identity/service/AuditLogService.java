package com.codecheckhub.identity.service;

import com.codecheckhub.identity.entity.AuditLog;
import com.codecheckhub.identity.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public void log(String level, String event, String actor, String ip) {
        AuditLog log = AuditLog.builder()
                .level(level)
                .event(event)
                .actor(actor != null ? actor : "System")
                .ip(ip != null ? ip : "127.0.0.1")
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLog> getLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
