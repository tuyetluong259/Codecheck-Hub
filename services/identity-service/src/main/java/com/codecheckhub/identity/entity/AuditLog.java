package com.codecheckhub.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue
    private UUID id;

    @CreationTimestamp
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String level; // CRITICAL, WARNING, INFO, OK

    @Column(nullable = false, length = 500)
    private String event;

    private String actor;
    private String ip;
}
