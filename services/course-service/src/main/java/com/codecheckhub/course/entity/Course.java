package com.codecheckhub.course.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "classes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "class_id")
    private UUID id;

    @Column(name = "class_name", nullable = false)
    private String name;

    @Column(name = "class_code", nullable = false, unique = true)
    private String code;          // Mã lớp học (ví dụ: CS101-2024)

    @Column(name = "teacher_id", nullable = false)
    private UUID teacherId;       // ID giảng viên (từ identity-service)

    @Column
    private String description;



    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
