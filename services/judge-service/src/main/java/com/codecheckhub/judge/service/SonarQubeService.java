package com.codecheckhub.judge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.io.File;
import java.util.UUID;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@Slf4j
@RequiredArgsConstructor
public class SonarQubeService {

    @Value("${sonar.url:http://localhost:9000}")
    private String sonarUrl;

    @Value("${sonar.token:}")
    private String sonarToken;

    private final DockerSandboxService dockerSandboxService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Phân tích code qua SonarQube API và trả về danh sách issues (JSON)
     * Note: Trong thực tế, SonarQube cần chạy scanner CLI.
     * Đây là simplified version gọi API để lấy metrics sau khi scanner đã chạy.
     */
    public String analyzeCode(String code, String language, String projectKey) {
        if (sonarToken == null || sonarToken.isEmpty()) {
            log.warn("SonarQube token not configured, skipping analysis");
            return null;
        }

        try {
            // Gọi SonarQube Issues API
            String url = sonarUrl + "/api/issues/search?componentKeys=" + projectKey
                    + "&types=BUG,CODE_SMELL,VULNERABILITY&pageSize=20";

            HttpHeaders headers = new HttpHeaders();
            String auth = sonarToken + ":";
            headers.set("Authorization", "Basic " +
                    Base64.getEncoder().encodeToString(auth.getBytes()));
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("SonarQube API call failed: {}", e.getMessage());
        }

        return null;
    }

    /**
     * Phân tích code đơn giản theo quy tắc cơ bản (không cần SonarQube)
     * Dùng làm fallback khi SonarQube không khả dụng
     */
    public List<Map<String, String>> simpleCodeReview(String code, String language) {
        List<Map<String, String>> issues = new ArrayList<>();

        if (code == null || code.isEmpty()) return issues;

        String[] lines = code.split("\n");

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            int lineNum = i + 1;

            // Kiểm tra biến tên 1 ký tự (trừ i, j, k, n, x, y trong vòng lặp)
            if (line.matches(".*\\b(int|String|double|float|long)\\s+[a-hm-wz]\\s*[=;].*")
                    && !line.contains("for")) {
                issues.add(Map.of(
                        "line", String.valueOf(lineNum),
                        "type", "CODE_SMELL",
                        "message", "Variable name too short. Use descriptive names."
                ));
            }

            // Magic numbers — BUG FIX: bọc qua line rỗng trước khi check regex
            if (!line.isEmpty() &&
                    (language.equalsIgnoreCase("CPP") || language.equalsIgnoreCase("JAVA"))) {
                if (line.matches(".*[^\\d][2-9][0-9]{2,}[^\\d].*")
                        && !line.startsWith("//") && !line.startsWith("*")) {
                    issues.add(Map.of(
                            "line", String.valueOf(lineNum),
                            "type", "CODE_SMELL",
                            "message", "Magic number detected. Consider using a named constant."
                    ));
                }
            }

            // Empty catch block — BUG FIX: thiếu ngoặc trong điều kiện gây sai operator precedence
            if (line.startsWith("catch") && (i + 1) < lines.length
                    && lines[i + 1].trim().equals("}")) {
                issues.add(Map.of(
                        "line", String.valueOf(lineNum),
                        "type", "BUG",
                        "message", "Empty catch block. Handle or log the exception."
                ));
            }
        }

        return issues;
    }

    /**
     * Chạy quy trình phân tích đầy đủ: Lưu file -> Chạy Scanner -> Gọi API lấy kết quả.
     */
    public String executeRealReview(String code, String language, String projectKey) {
        if (sonarToken == null || sonarToken.isEmpty()) {
            log.warn("SonarQube token missing. Fallback to simple review.");
            return serializeFallback(code, language);
        }

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("sonar-" + UUID.randomUUID());
            String filename = getFilename(language);
            Files.writeString(tempDir.resolve(filename), code);

            log.info("Starting Sonar scanner for project {}", projectKey);
            // Sửa host URL để chạy trong mạng docker (sonarUrl nội bộ phải là http://sonarqube:9000)
            boolean success = dockerSandboxService.runSonarScanner(tempDir, projectKey, sonarUrl, sonarToken);
            
            if (success) {
                log.info("Sonar scanner completed for {}. Fetching results from API.", projectKey);
                String apiResult = analyzeCode(code, language, projectKey);
                if (apiResult != null) return apiResult;
            } else {
                log.warn("Sonar scanner failed for {}. Fallback to simple review.", projectKey);
            }
        } catch (Exception e) {
            log.error("Error executing real Sonar review: {}", e.getMessage());
        } finally {
            if (tempDir != null) {
                deleteDirectory(tempDir.toFile());
            }
        }

        return serializeFallback(code, language);
    }

    private String serializeFallback(String code, String language) {
        try {
            return objectMapper.writeValueAsString(simpleCodeReview(code, language));
        } catch (Exception e) {
            return "[]";
        }
    }

    private String getFilename(String language) {
        return switch (language.toUpperCase()) {
            case "CPP"    -> "solution.cpp";
            case "JAVA"   -> "Solution.java";
            case "PYTHON" -> "solution.py";
            default -> "solution.txt";
        };
    }

    private void deleteDirectory(File dir) {
        if (dir.isDirectory()) {
            File[] files = dir.listFiles();
            if (files != null) Arrays.stream(files).forEach(this::deleteDirectory);
        }
        dir.delete();
    }
}
