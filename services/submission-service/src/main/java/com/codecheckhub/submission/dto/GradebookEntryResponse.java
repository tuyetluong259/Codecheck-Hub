package com.codecheckhub.submission.dto;

import com.codecheckhub.submission.entity.Submission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradebookEntryResponse {
    private Submission submission;
    private String studentName;
    private String studentCode;
}
