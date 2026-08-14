package com.codecheckhub.course.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CreateTestCaseRequest {
    private UUID problemId;
    private String input;
    private String expectedOutput;
    private boolean isHidden;
    private int points = 10;
    private int orderIndex = 0;
}
