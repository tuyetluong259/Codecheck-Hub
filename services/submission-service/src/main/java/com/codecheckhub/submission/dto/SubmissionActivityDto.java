package com.codecheckhub.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionActivityDto {
    private UUID id;
    private UUID problemId;
    private UUID studentId;
    private String status;
    private LocalDateTime submittedAt;
}
