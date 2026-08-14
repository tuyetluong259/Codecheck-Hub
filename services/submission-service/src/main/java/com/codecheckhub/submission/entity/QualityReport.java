package com.codecheckhub.submission.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "quality_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QualityReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "report_id")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @Column(name = "bugs_count", nullable = false)
    @Builder.Default
    private int bugsCount = 0;

    @Column(name = "code_smells_count", nullable = false)
    @Builder.Default
    private int codeSmellsCount = 0;

    @Column(name = "vulnerabilities_count", nullable = false)
    @Builder.Default
    private int vulnerabilitiesCount = 0;
}
