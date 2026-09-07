package com.codecheckhub.course.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class PlagiarismAlertDto {
    private UUID submissionId;
    private UUID studentId;
    private String studentName;
    private UUID problemId;
    private String problemName;
    private Double plagiarismScore;
}
