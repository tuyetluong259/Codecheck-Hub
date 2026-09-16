package com.codecheckhub.submission.dto;

import com.codecheckhub.submission.entity.Submission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlagiarismResponse {
    private Submission submission;
    private String studentName;
    private String studentCode;
    private String matchedStudentName;
    private String matchedStudentCode;
}
