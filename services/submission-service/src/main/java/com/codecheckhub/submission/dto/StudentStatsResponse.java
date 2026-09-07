package com.codecheckhub.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatsResponse {
    private long totalSubmissions;
    private long acceptedCount;
    private long failedCount;
    private long pendingCount;
    private long otherCount;
    private double acceptanceRate;
    private int averageCleanCodeScore;
    private long totalProblemsSolved;
}
