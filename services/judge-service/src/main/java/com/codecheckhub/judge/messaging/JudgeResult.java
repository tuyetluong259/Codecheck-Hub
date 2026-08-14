package com.codecheckhub.judge.messaging;

import lombok.*;
import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JudgeResult implements Serializable {
    private UUID submissionId;
    private UUID studentId;
    private String overallStatus;
    private Integer score;
    private Integer passedCount;
    private Integer totalCount;
    private String compileError;
    private String sonarIssues;
    private List<TestResult> results;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
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
