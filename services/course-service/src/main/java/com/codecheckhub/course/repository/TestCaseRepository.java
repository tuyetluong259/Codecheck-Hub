package com.codecheckhub.course.repository;

import com.codecheckhub.course.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, UUID> {
    List<TestCase> findByProblemIdOrderByOrderIndexAsc(UUID problemId);
    List<TestCase> findByProblemIdAndIsHiddenFalseOrderByOrderIndexAsc(UUID problemId);
}
