package com.codecheckhub.submission.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "submissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "submission_id")
    private UUID id;

    @Column(name = "problem_id", nullable = false)
    private UUID problemId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "source_code", nullable = false, columnDefinition = "TEXT")
    private String sourceCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column
    private Integer score;          // Tổng điểm sau khi chấm

    @Column
    private Integer passedTestCases;

    @Column
    private Integer totalTestCases;

    @Column(columnDefinition = "TEXT")
    private String compileError;    // Lỗi biên dịch nếu có

    @Column(name = "execution_time")
    private Long executionTime;     // (ms)

    @Column(name = "memory_used")
    private Long memoryUsed;        // (MB)

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SubmissionResult> results = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime submittedAt;

    @Column
    private LocalDateTime judgedAt;

    public enum Language {
        CPP, JAVA, PYTHON
    }

    public enum Status {
        PENDING,        // Đang chờ trong queue
        RUNNING,        // Đang chạy
        ACCEPTED,       // Đúng tất cả
        WRONG_ANSWER,   // Sai đáp án
        TIME_LIMIT,     // Quá thời gian
        MEMORY_LIMIT,   // Quá bộ nhớ
        RUNTIME_ERROR,  // Lỗi runtime
        COMPILE_ERROR   // Lỗi biên dịch
    }
}
