package com.codecheckhub.course.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardDetailsResponse {
    private List<ActivityDto> recentActivities;
    private List<ProgressDto> gradingProgress;
}
