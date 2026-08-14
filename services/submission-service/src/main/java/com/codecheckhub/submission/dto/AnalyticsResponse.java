package com.codecheckhub.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private double acceptanceRate;
    private double averageSubmissionsPerProblem;
    private int totalBugs;
    private int totalCodeSmells;
    private int totalVulnerabilities;
}
