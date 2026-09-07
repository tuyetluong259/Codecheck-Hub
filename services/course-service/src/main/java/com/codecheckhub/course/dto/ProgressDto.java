package com.codecheckhub.course.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProgressDto {
    private String courseName;
    private String problemName;
    private long submittedCount;
    private long totalStudents;
    private double progressPercentage;
}
