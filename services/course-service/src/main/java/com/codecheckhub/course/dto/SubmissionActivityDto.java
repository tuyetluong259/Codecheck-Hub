package com.codecheckhub.course.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SubmissionActivityDto {
    private UUID id;
    private UUID problemId;
    private UUID studentId;
    private String status;
    private LocalDateTime submittedAt;
}
