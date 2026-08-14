package com.codecheckhub.submission.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JudgeResult implements Serializable {
    private UUID submissionId;
    private UUID studentId;
    private String overallStatus;       // ACCEPTED, WRONG_ANSWER, etc.
    private Integer score;
    private Integer passedCount;
    private Integer totalCount;
    private String compileError;
    private String sonarIssues;         // JSON
    private List<TestResult> results;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestResult {
        private UUID testCaseId;
        private String status;
        private Long timeMs;
        private Long memoryMb;
        private String actualOutput;
        private String errorMessage;
        private boolean isHidden;
        private int orderIndex;
    }
}
