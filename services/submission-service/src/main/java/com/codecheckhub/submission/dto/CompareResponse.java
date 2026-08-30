package com.codecheckhub.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompareResponse {
    private UUID student1Id;
    private String code1;
    private UUID student2Id;
    private String code2;
    private Double plagiarismScore;
}
