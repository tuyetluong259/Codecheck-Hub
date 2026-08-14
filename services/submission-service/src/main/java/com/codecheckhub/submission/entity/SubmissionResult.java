package com.codecheckhub.submission.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "submission_results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @Column(nullable = false)
    private UUID testCaseId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Submission.Status status;

    @Column
    private Long timeMs;        // Thời gian chạy (ms)

    @Column
    private Long memoryMb;      // Bộ nhớ dùng (MB)

    @Column(columnDefinition = "TEXT")
    private String actualOutput;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
    @Builder.Default
    private int orderIndex = 0;

    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private boolean isHidden = true;   // Test case này có public không
}
