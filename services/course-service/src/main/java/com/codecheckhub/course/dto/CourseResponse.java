package com.codecheckhub.course.dto;

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
public class CourseResponse {
    private UUID id;
    private String name;
    private String code;
    private UUID teacherId;
    private String teacherName;
    private String description;
    private String syllabus;
    private String passingCriteria;
    private String passingCriteriaFile;
    private boolean allowJoinByCode;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // For student course responses, percentage of completed problems
    @Builder.Default
    private Double progress = 0.0;
}
