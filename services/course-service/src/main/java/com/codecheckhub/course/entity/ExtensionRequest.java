package com.codecheckhub.course.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "extension_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExtensionRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private UUID problemId;
    
    @Column(nullable = false)
    private UUID courseId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;
    
    @Column(nullable = false)
    private LocalDateTime requestedDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}
