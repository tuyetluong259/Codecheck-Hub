package com.codecheckhub.course.service;

import com.codecheckhub.course.dto.CreateProblemRequest;
import com.codecheckhub.course.entity.Problem;
import com.codecheckhub.course.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;

    public List<Problem> getProblemsByCourseId(UUID courseId) {
        return problemRepository.findByCourseId(courseId);
    }

    public Problem getProblemById(UUID id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
    }

    @Transactional
    public Problem createProblem(CreateProblemRequest request) {
        Problem problem = Problem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .inputFormat(request.getInputFormat())
                .outputFormat(request.getOutputFormat())
                .constraints(request.getConstraints())
                .difficulty(Problem.Difficulty.valueOf(request.getDifficulty()))
                .courseId(request.getCourseId())
                .deadline(request.getDeadline())
                .timeLimitMs(request.getTimeLimitMs())
                .memoryLimitMb(request.getMemoryLimitMb())
                .maxScore(request.getMaxScore())
                .published(request.isPublished())
                .maxCyclomaticComplexity(request.getMaxCyclomaticComplexity())
                .namingConvention(request.getNamingConvention())
                .build();
        return problemRepository.save(problem);
    }
}
