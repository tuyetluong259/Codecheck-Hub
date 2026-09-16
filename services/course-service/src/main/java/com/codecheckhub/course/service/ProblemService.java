package com.codecheckhub.course.service;

import com.codecheckhub.course.dto.CreateProblemRequest;
import com.codecheckhub.course.entity.Problem;
import com.codecheckhub.course.entity.Course;
import com.codecheckhub.course.repository.ProblemRepository;
import com.codecheckhub.course.repository.CourseRepository;
import com.codecheckhub.course.repository.ClassMemberRepository;
import com.codecheckhub.course.repository.TestCaseRepository;
import com.codecheckhub.course.entity.ClassMember;
import com.codecheckhub.course.entity.TestCase;
import com.codecheckhub.course.dto.CreateTestCaseRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final CourseRepository courseRepository;
    private final ClassMemberRepository classMemberRepository;
    private final TestCaseRepository testCaseRepository;

    public List<Problem> getProblemsByCourseId(UUID courseId) {
        return problemRepository.findByCourseId(courseId);
    }

    public List<Problem> getProblemsByTeacherId(UUID teacherId) {
        List<UUID> courseIds = courseRepository.findByTeacherId(teacherId)
                .stream()
                .map(Course::getId)
                .toList();
        if (courseIds.isEmpty()) return List.of();
        return problemRepository.findByCourseIdIn(courseIds);
    }

    public List<com.codecheckhub.course.dto.StudentProblemResponse> getProblemsByStudentId(UUID studentId) {
        List<UUID> courseIds = classMemberRepository.findByStudentId(studentId)
                .stream()
                .map(ClassMember::getClassId)
                .toList();
        if (courseIds.isEmpty()) return List.of();
        
        List<Problem> problems = problemRepository.findByCourseIdIn(courseIds).stream()
                .filter(Problem::isPublished)
                .toList();
                
        // Fetch statuses from submission-service
        java.util.Map<UUID, String> statuses = new java.util.HashMap<>();
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "http://submission-service:8083/api/internal/submissions/student/" + studentId + "/problem-statuses";
            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.getForEntity(url, java.util.Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                response.getBody().forEach((k, v) -> statuses.put(UUID.fromString(k.toString()), v.toString()));
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ProblemService.class).warn("Failed to fetch problem statuses: {}", e.getMessage());
        }

        return problems.stream()
                .map(p -> {
                    String courseName = courseRepository.findById(p.getCourseId())
                            .map(Course::getName)
                            .orElse("Không xác định");
                    return com.codecheckhub.course.dto.StudentProblemResponse.fromProblem(
                            p, 
                            statuses.getOrDefault(p.getId(), "NOT_STARTED"),
                            courseName
                    );
                })
                .toList();
    }

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
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
                .isPractice(request.isPractice())
                .build();
        Problem savedProblem = problemRepository.save(problem);

        if (request.getTestCases() != null && !request.getTestCases().isEmpty()) {
            List<TestCase> testCases = request.getTestCases().stream().map(tc -> TestCase.builder()
                    .problemId(savedProblem.getId())
                    .input(tc.getInput())
                    .expectedOutput(tc.getExpectedOutput())
                    .isHidden(tc.isHidden())
                    .points(tc.getPoints() > 0 ? tc.getPoints() : 10)
                    .orderIndex(tc.getOrderIndex())
                    .build()).collect(Collectors.toList());
            testCaseRepository.saveAll(testCases);
        }

        return savedProblem;
    }

    @Transactional
    public Problem updateProblemPublishStatus(UUID id, boolean published) {
        Problem problem = getProblemById(id);
        problem.setPublished(published);
        return problemRepository.save(problem);
    }
}
