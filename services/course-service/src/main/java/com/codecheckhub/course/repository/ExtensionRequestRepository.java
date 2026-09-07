package com.codecheckhub.course.repository;

import com.codecheckhub.course.entity.ExtensionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExtensionRequestRepository extends JpaRepository<ExtensionRequest, UUID> {
    List<ExtensionRequest> findByCourseIdInOrderByCreatedAtDesc(List<UUID> courseIds);
    List<ExtensionRequest> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
