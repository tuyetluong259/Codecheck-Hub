package com.codecheckhub.judge.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.*;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.Data;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Arrays;
import java.util.UUID;
import java.util.concurrent.*;

@Service
@Slf4j
public class DockerSandboxService {

    @Value("${docker.host:unix:///var/run/docker.sock}")
    private String dockerHost;

    @Value("${docker.sandbox.timeout-seconds:15}")
    private int timeoutSeconds;

    private DockerClient dockerClient;

    @PostConstruct
    public void init() {
        var config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                .withDockerHost(dockerHost)
                .build();

        var transport = new ApacheDockerHttpClient.Builder()
                .dockerHost(URI.create(dockerHost))
                .maxConnections(50)
                .connectionTimeout(Duration.ofSeconds(30))
                .responseTimeout(Duration.ofSeconds(60))
                .build();

        dockerClient = DockerClientImpl.getInstance(config, transport);
        log.info("Docker client initialized with host: {}", dockerHost);
    }

    @PreDestroy
    public void destroy() throws IOException {
        if (dockerClient != null) {
            dockerClient.close();
        }
    }

    /**
     * Chạy code trong Docker sandbox và trả về kết quả
     */
    public SandboxResult run(String code, String language, String input,
                             int timeLimitMs, int memoryLimitMb) {
        String containerId = null;
        Path tempDir = null;

        try {
            // 1. Tạo thư mục tạm chứa code
            tempDir = Files.createTempDirectory("sandbox-" + UUID.randomUUID());
            String filename = getFilename(language);
            Path codePath = tempDir.resolve(filename);
            Files.writeString(codePath, code);

            // 2. Chuẩn bị lệnh chạy
            String[] cmd = buildCommand(language, filename);

            // 3. Tạo container
            long memoryBytes = (long) memoryLimitMb * 1024 * 1024;
            String image = getImage(language);

            HostConfig hostConfig = HostConfig.newHostConfig()
                    .withMemory(memoryBytes)
                    .withMemorySwap(memoryBytes)           // Disable swap
                    .withNetworkMode("none")               // Không có mạng
                    .withReadonlyRootfs(false)
                    .withBinds(new Bind(tempDir.toAbsolutePath().toString(),
                            new Volume("/sandbox"), AccessMode.ro));

            CreateContainerResponse container = dockerClient.createContainerCmd(image)
                    .withCmd(cmd)
                    .withStdinOpen(true)
                    .withAttachStdin(true)
                    .withWorkingDir("/sandbox")
                    .withHostConfig(hostConfig)
                    .exec();

            containerId = container.getId();

            // 4. Start container
            long startTime = System.currentTimeMillis();
            dockerClient.startContainerCmd(containerId).exec();

            // 5. Đưa input vào stdin — BUG FIX: attach phải xảy ra TRƯỚC khi container bắt đầu đọc stdin
            //    Dùng execStart để pipe stdin vào process
            if (input != null && !input.isEmpty()) {
                final String cid = containerId;
                final byte[] inputBytes = (input + "\n").getBytes();
                // Attach stdin không đồng bộ, không block
                new Thread(() -> {
                    try (var attachCmd = dockerClient.attachContainerCmd(cid)
                            .withStdIn(new ByteArrayInputStream(inputBytes))
                            .withFollowStream(true)
                            .withStdOut(false)
                            .withStdErr(false)) {
                        attachCmd.exec(new com.github.dockerjava.api.async.ResultCallback.Adapter<com.github.dockerjava.api.model.Frame>() {});
                    } catch (Exception e) {
                        log.warn("Stdin attach error: {}", e.getMessage());
                    }
                }).start();
            }

            // 6. Chờ container kết thúc với timeout — BUG FIX: hardTimeout phải là long
            final String finalContainerId = containerId;
            CompletableFuture<Integer> exitFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    dockerClient.waitContainerCmd(finalContainerId)
                            .start().awaitCompletion();
                    var state = dockerClient.inspectContainerCmd(finalContainerId).exec().getState();
                    return state != null && state.getExitCodeLong() != null
                            ? state.getExitCodeLong().intValue() : -1;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return -1;
                }
            });

            // BUG FIX: hardTimeout phải dùng long để tránh overflow, và phải đủ lớn
            long hardTimeout = Math.max((long) timeoutSeconds * 1000L, (long) timeLimitMs + 5000L);
            int exitCode = 0;
            boolean timedOut = false;

            try {
                exitCode = exitFuture.get(hardTimeout, TimeUnit.MILLISECONDS);
            } catch (TimeoutException e) {
                timedOut = true;
                exitCode = -1;
                try {
                    dockerClient.killContainerCmd(containerId).exec();
                } catch (Exception killEx) {
                    log.warn("Failed to kill container {}: {}", containerId, killEx.getMessage());
                }
            } catch (ExecutionException e) {
                log.error("Exit future error: {}", e.getMessage());
                exitCode = -1;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                exitCode = -1;
            }

            long elapsedMs = System.currentTimeMillis() - startTime;

            // 7. Đọc output — BUG FIX: getLogs có thể trả về null nếu stderr/stdout rỗng
            String stdout = getLogs(containerId, true);
            String stderr = getLogs(containerId, false);
            if (stdout == null) stdout = "";
            if (stderr == null) stderr = "";

            return SandboxResult.builder()
                    .stdout(stdout.trim())
                    .stderr(stderr.trim())
                    .exitCode(exitCode)
                    .timeMs(elapsedMs)
                    .memoryMb(0L) // Memory stats không khả dụng sau container dừng
                    .timedOut(timedOut || elapsedMs > timeLimitMs)
                    .build();

        } catch (Exception e) {
            log.error("Sandbox execution error: ", e);
            return SandboxResult.builder()
                    .stdout("")
                    .stderr("Internal judge error: " + e.getMessage())
                    .exitCode(-1)
                    .timeMs(0L)
                    .memoryMb(0L)
                    .build();
        } finally {
            // 8. Cleanup — luôn xoá container và thư mục tạm
            if (containerId != null) {
                try {
                    dockerClient.removeContainerCmd(containerId).withForce(true).exec();
                } catch (Exception e) {
                    log.warn("Failed to remove container {}: {}", containerId, e.getMessage());
                }
            }
            if (tempDir != null) {
                try {
                    deleteDirectory(tempDir.toFile());
                } catch (Exception e) {
                    log.warn("Failed to delete temp dir: {}", e.getMessage());
                }
            }
        }
    }

    private String getFilename(String language) {
        return switch (language.toUpperCase()) {
            case "CPP"    -> "solution.cpp";
            case "JAVA"   -> "Solution.java";
            case "PYTHON" -> "solution.py";
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private String[] buildCommand(String language, String filename) {
        return switch (language.toUpperCase()) {
            // BUG FIX: thêm -std=c++17, redirect stderr để bắt compile lỗi
            case "CPP" -> new String[]{"sh", "-c",
                    "g++ -std=c++17 -O2 -o /tmp/solution /sandbox/" + filename
                    + " 2>&1 && /tmp/solution"};
            // BUG FIX: Java cần compile từ đúng path rồi chạy từ đó
            case "JAVA" -> new String[]{"sh", "-c",
                    "javac /sandbox/" + filename + " -d /tmp 2>&1 && java -cp /tmp Solution"};
            // BUG FIX: thêm -u để unbuffer output Python
            case "PYTHON" -> new String[]{"python3", "-u", "/sandbox/" + filename};
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private String getImage(String language) {
        return switch (language.toUpperCase()) {
            case "CPP"    -> "sandbox-cpp:latest";
            case "JAVA"   -> "sandbox-java:latest";
            case "PYTHON" -> "sandbox-python:latest";
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private String getLogs(String containerId, boolean isStdout) {
        StringBuilder sb = new StringBuilder();
        try {
            dockerClient.logContainerCmd(containerId)
                    .withStdOut(isStdout)
                    .withStdErr(!isStdout)
                    .withFollowStream(false)
                    .exec(new com.github.dockerjava.api.async.ResultCallback.Adapter<
                            com.github.dockerjava.api.model.Frame>() {
                        @Override
                        public void onNext(Frame frame) {
                            if (frame != null && frame.getPayload() != null) {
                                sb.append(new String(frame.getPayload()));
                            }
                        }
                    }).awaitCompletion();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.warn("Failed to get logs for container {}: {}", containerId, e.getMessage());
        }
        return sb.toString();
    }

    private void deleteDirectory(File dir) {
        if (dir.isDirectory()) {
            File[] files = dir.listFiles();
            if (files != null) {
                Arrays.stream(files).forEach(this::deleteDirectory);
            }
        }
        if (!dir.delete()) {
            log.warn("Could not delete: {}", dir.getAbsolutePath());
        }
    }

    /**
     * Chạy sonar-scanner-cli trong Docker để phân tích code
     */
    public boolean runSonarScanner(Path sourceDir, String projectKey, String sonarUrl, String sonarToken) {
        String containerId = null;
        try {
            // Đảm bảo image có sẵn (tự động pull nếu thiếu, nhưng docker-java createContainerCmd cần có sẵn image. 
            // Ở đây giả định image đã được pull sẵn hoặc Docker tự xử lý)
            String image = "sonarsource/sonar-scanner-cli:latest";
            
            // Tìm network của compose hiện tại (dựa theo quy tắc đặt tên mặc định)
            String networkName = "codecheckhub_codecheckHub-net";
            
            HostConfig hostConfig = HostConfig.newHostConfig()
                    .withNetworkMode(networkName) // Kết nối chung mạng với sonarqube
                    .withBinds(new Bind(sourceDir.toAbsolutePath().toString(),
                            new Volume("/usr/src"), AccessMode.ro));

            CreateContainerResponse container = dockerClient.createContainerCmd(image)
                    .withCmd(
                        "sonar-scanner",
                        "-Dsonar.projectKey=" + projectKey,
                        "-Dsonar.sources=.",
                        "-Dsonar.host.url=" + sonarUrl,
                        "-Dsonar.login=" + sonarToken,
                        "-Dsonar.qualitygate.wait=true"
                    )
                    .withHostConfig(hostConfig)
                    .exec();

            containerId = container.getId();
            dockerClient.startContainerCmd(containerId).exec();

            final String finalContainerId = containerId;
            CompletableFuture<Integer> exitFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    dockerClient.waitContainerCmd(finalContainerId).start().awaitCompletion();
                    var state = dockerClient.inspectContainerCmd(finalContainerId).exec().getState();
                    return state != null && state.getExitCodeLong() != null
                            ? state.getExitCodeLong().intValue() : -1;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return -1;
                }
            });

            int exitCode = exitFuture.get(60, TimeUnit.SECONDS);
            
            if (exitCode != 0) {
                log.warn("Sonar scanner failed with exit code {}. Logs: {}", exitCode, getLogs(containerId, false));
                return false;
            }
            return true;
        } catch (Exception e) {
            log.error("Failed to run sonar scanner: {}", e.getMessage());
            return false;
        } finally {
            if (containerId != null) {
                try {
                    dockerClient.removeContainerCmd(containerId).withForce(true).exec();
                } catch (Exception e) {
                    log.warn("Failed to remove sonar container {}: {}", containerId, e.getMessage());
                }
            }
        }
    }

    @Data
    @Builder
    public static class SandboxResult {
        private String stdout;
        private String stderr;
        private int exitCode;
        private long timeMs;
        private long memoryMb;
        private boolean timedOut;
    }
}
