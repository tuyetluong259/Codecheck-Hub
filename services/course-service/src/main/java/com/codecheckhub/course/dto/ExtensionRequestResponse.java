package com.codecheckhub.course.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ExtensionRequestResponse {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private UUID problemId;
    private String problemName;
    private UUID courseId;
    private String reason;
    private LocalDateTime requestedDeadline;
    private String status;
    private LocalDateTime createdAt;
}
