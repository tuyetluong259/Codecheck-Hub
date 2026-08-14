package com.codecheckhub.course.service;

import com.codecheckhub.course.dto.CreateTestCaseRequest;
import com.codecheckhub.course.entity.TestCase;
import com.codecheckhub.course.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;

    public List<TestCase> getTestCasesByProblem(UUID problemId, boolean publicOnly) {
        if (publicOnly) {
            return testCaseRepository.findByProblemIdAndIsHiddenFalseOrderByOrderIndexAsc(problemId);
        }
        return testCaseRepository.findByProblemIdOrderByOrderIndexAsc(problemId);
    }

    @Transactional
    public TestCase createTestCase(CreateTestCaseRequest request) {
        TestCase testCase = TestCase.builder()
                .problemId(request.getProblemId())
                .input(request.getInput())
                .expectedOutput(request.getExpectedOutput())
                .isHidden(request.isHidden())
                .points(request.getPoints())
                .orderIndex(request.getOrderIndex())
                .build();
        return testCaseRepository.save(testCase);
    }
}
