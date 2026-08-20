package com.codecheckhub.submission.repository;

import com.codecheckhub.submission.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByProblemIdAndStudentIdOrderBySubmittedAtDesc(UUID problemId, UUID studentId);
    List<Submission> findByStudentIdOrderBySubmittedAtDesc(UUID studentId);
    List<Submission> findByProblemIdOrderBySubmittedAtDesc(UUID problemId);
    List<Submission> findByProblemIdIn(List<UUID> problemIds);
    List<Submission> findByProblemIdAndStudentIdNot(UUID problemId, UUID studentId);
}
