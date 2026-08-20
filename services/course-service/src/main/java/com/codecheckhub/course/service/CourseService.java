package com.codecheckhub.course.service;

import com.codecheckhub.course.dto.CreateCourseRequest;
import com.codecheckhub.course.entity.Course;
import com.codecheckhub.course.entity.ClassMember;
import com.codecheckhub.course.entity.Problem;
import com.codecheckhub.course.repository.CourseRepository;
import com.codecheckhub.course.repository.ClassMemberRepository;
import com.codecheckhub.course.repository.ProblemRepository;
import com.codecheckhub.course.dto.AnalyticsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ClassMemberRepository classMemberRepository;
    private final ProblemRepository problemRepository;
    private final RestTemplate restTemplate;

    @Value("${submission.service.url:http://localhost:8083}")
    private String submissionServiceUrl;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Transactional
    public Course createCourse(CreateCourseRequest request, UUID teacherId) {
        if (courseRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Course code already exists");
        }
        Course course = Course.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .teacherId(teacherId)
                .build();
        return courseRepository.save(course);
    }

    @Transactional
    public void enrollStudent(UUID courseId, UUID studentId) {
        Course course = getCourseById(courseId); // validate course exists
        if (classMemberRepository.findByClassIdAndStudentId(courseId, studentId).isEmpty()) {
            ClassMember member = ClassMember.builder()
                    .classId(courseId)
                    .studentId(studentId)
                    .build();
            classMemberRepository.save(member);
        } else {
            throw new RuntimeException("Student is already enrolled in this course");
        }
    }

    @Transactional
    public void joinCourseByCode(String code, UUID studentId) {
        Course course = courseRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Class code not found"));
        
        if (classMemberRepository.findByClassIdAndStudentId(course.getId(), studentId).isPresent()) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        ClassMember member = ClassMember.builder()
                .classId(course.getId())
                .studentId(studentId)
                .build();
        classMemberRepository.save(member);
    }

    public AnalyticsResponse getCourseAnalytics(UUID courseId) {
        Course course = getCourseById(courseId); // validate
        
        List<Problem> problems = problemRepository.findByCourseId(course.getId());
        List<UUID> problemIds = problems.stream()
                .map(Problem::getId)
                .collect(Collectors.toList());

        if (problemIds.isEmpty()) {
            return AnalyticsResponse.builder().build();
        }

        String url = submissionServiceUrl + "/api/internal/submissions/analytics";
        try {
            ResponseEntity<AnalyticsResponse> response = restTemplate.postForEntity(url, problemIds, AnalyticsResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(CourseService.class).warn("Failed to fetch analytics from submission-service: {}", e.getMessage());
        }
        
        return AnalyticsResponse.builder().build();
    }
}
