package com.codecheckhub.course.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "problems")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "problem_id")
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;     // Markdown/HTML

    @Column(columnDefinition = "TEXT")
    private String inputFormat;

    @Column(columnDefinition = "TEXT")
    private String outputFormat;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(name = "class_id", nullable = false)
    private UUID courseId;

    @Column
    private LocalDateTime deadline;

    @Column(name = "time_limit", nullable = false)
    @Builder.Default
    private int timeLimitMs = 2000;      // Giới hạn thời gian (ms)

    @Column(name = "memory_limit", nullable = false)
    @Builder.Default
    private int memoryLimitMb = 256;     // Giới hạn bộ nhớ (MB)

    @Column(nullable = false)
    @Builder.Default
    private int maxScore = 100;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = false;   // Giảng viên phải publish mới hiện với SV

    @Column(name = "max_complexity")
    private Integer maxCyclomaticComplexity;

    @Column(name = "naming_convention")
    private String namingConvention;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
}
