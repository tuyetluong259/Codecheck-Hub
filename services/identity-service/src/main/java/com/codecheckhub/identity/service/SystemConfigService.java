package com.codecheckhub.identity.service;

import com.codecheckhub.identity.entity.SystemConfig;
import com.codecheckhub.identity.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemConfigService {
    private final SystemConfigRepository systemConfigRepository;
    private final AuditLogService auditLogService;

    public List<SystemConfig> getAllConfigs() {
        return systemConfigRepository.findAll();
    }

    public void updateConfig(String key, String value) {
        SystemConfig config = systemConfigRepository.findByConfigKey(key).orElseGet(() -> 
            SystemConfig.builder().configKey(key).build()
        );
        config.setConfigValue(value);
        systemConfigRepository.save(config);
        auditLogService.log("WARNING", "Updated system config " + key + " to " + value, "Admin", null);
    }
}
