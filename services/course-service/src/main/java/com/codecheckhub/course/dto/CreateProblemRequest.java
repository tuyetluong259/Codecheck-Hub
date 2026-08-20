package com.codecheckhub.course.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateProblemRequest {
    private String title;
    private String description;
    private String inputFormat;
    private String outputFormat;
    private String constraints;
    private String difficulty; // EASY, MEDIUM, HARD
    private UUID courseId;
    private LocalDateTime deadline;
    private int timeLimitMs = 2000;
    private int memoryLimitMb = 256;
    private int maxScore = 100;
    private boolean published = true;
    private Integer maxCyclomaticComplexity;
    private String namingConvention;
}
