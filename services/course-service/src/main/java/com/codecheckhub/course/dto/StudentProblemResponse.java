package com.codecheckhub.course.dto;

import com.codecheckhub.course.entity.Problem;
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
public class StudentProblemResponse {
    private UUID id;
    private String title;
    private String description;
    private String difficulty;
    private String status; // ACCEPTED, FAILED, PENDING, NOT_STARTED
    @com.fasterxml.jackson.annotation.JsonProperty("isPractice")
    private boolean isPractice;
    private String courseName;
    private LocalDateTime createdAt;
    
    public static StudentProblemResponse fromProblem(Problem problem, String status, String courseName) {
        return StudentProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .difficulty(problem.getDifficulty().name())
                .status(status)
                .isPractice(problem.isPractice())
                .courseName(courseName)
                .createdAt(problem.getCreatedAt())
                .build();
    }
}
