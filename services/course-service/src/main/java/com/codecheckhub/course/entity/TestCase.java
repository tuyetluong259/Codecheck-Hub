package com.codecheckhub.course.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "test_cases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "testcase_id")
    private UUID id;

    @Column(name = "problem_id", nullable = false)
    private UUID problemId;

    @Column(name = "input_data", nullable = false, columnDefinition = "TEXT")
    private String input;

    @Column(name = "expected_output", nullable = false, columnDefinition = "TEXT")
    private String expectedOutput;

    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private boolean isHidden = true;    // true = test case ẩn, false = sinh viên thấy

    @Column(nullable = false)
    @Builder.Default
    private int points = 10;             // Điểm mỗi test case

    @Column(nullable = false)
    @Builder.Default
    private int orderIndex = 0;
}
