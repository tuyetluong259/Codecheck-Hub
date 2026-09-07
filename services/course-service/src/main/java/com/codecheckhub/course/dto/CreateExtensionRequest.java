package com.codecheckhub.course.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateExtensionRequest {
    private String reason;
    private LocalDateTime requestedDeadline;
}
