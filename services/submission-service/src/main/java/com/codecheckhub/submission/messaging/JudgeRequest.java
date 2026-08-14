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
public class JudgeRequest implements Serializable {
    private UUID submissionId;
    private UUID problemId;
    private UUID studentId;
    private String sourceCode;
    private String language;        // CPP, JAVA, PYTHON
    private int timeLimitMs;
    private int memoryLimitMb;
    private List<TestCaseData> testCases;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseData {
        private UUID id;
        private String input;
        private String expectedOutput;
        private boolean isHidden;
        private int points;
    }
}
