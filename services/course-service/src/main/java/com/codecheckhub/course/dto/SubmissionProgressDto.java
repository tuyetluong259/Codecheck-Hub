package com.codecheckhub.course.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SubmissionProgressDto {
    private UUID problemId;
    private long distinctStudentCount;
}
