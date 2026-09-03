package com.codecheckhub.course.service;

import com.codecheckhub.course.dto.CreateCourseRequest;
import com.codecheckhub.course.entity.Course;
import com.codecheckhub.course.entity.ClassMember;
import com.codecheckhub.course.entity.Problem;
import com.codecheckhub.course.repository.CourseRepository;
import com.codecheckhub.course.repository.ClassMemberRepository;
import com.codecheckhub.course.repository.ProblemRepository;
import com.codecheckhub.course.dto.AnalyticsResponse;
import com.codecheckhub.course.dto.DashboardStatsResponse;
import com.codecheckhub.course.dto.ClassMemberResponse;
import com.codecheckhub.course.dto.UserResponseDto;
import com.codecheckhub.course.dto.ApiResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Collections;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ClassMemberRepository classMemberRepository;
    private final ProblemRepository problemRepository;
    private final RestTemplate restTemplate;

    @Value("${submission.service.url:http://localhost:8083}")
    private String submissionServiceUrl;

    @Value("${identity.service.url:http://localhost:8081}")
    private String identityServiceUrl;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByTeacherId(UUID teacherId) {
        return populateTeacherNames(courseRepository.findByTeacherId(teacherId));
    }

    public List<Course> getCoursesByStudentId(UUID studentId) {
        List<ClassMember> memberships = classMemberRepository.findByStudentId(studentId);
        List<Course> courses = memberships.stream()
                .map(m -> courseRepository.findById(m.getClassId()).orElse(null))
                .filter(c -> c != null)
                .collect(Collectors.toList());
        return populateTeacherNames(courses);
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

    public DashboardStatsResponse getDashboardStats(UUID teacherId) {
        List<Course> courses = courseRepository.findByTeacherId(teacherId);
        long totalCourses = courses.size();
        
        List<UUID> courseIds = courses.stream().map(Course::getId).collect(Collectors.toList());
        long totalStudents = courseIds.isEmpty() ? 0 : classMemberRepository.countDistinctStudentIdByClassIdIn(courseIds);
        long totalProblems = courseIds.isEmpty() ? 0 : problemRepository.findByCourseIdIn(courseIds).size();
        
        // Try to fetch plagiarism alerts from submission-service (if supported) or return 0 for now.
        long recentPlagiarismAlerts = 0;
        
        return DashboardStatsResponse.builder()
                .totalCourses(totalCourses)
                .totalStudents(totalStudents)
                .totalProblems(totalProblems)
                .recentPlagiarismAlerts(recentPlagiarismAlerts)
                .build();
    }

    public List<ClassMemberResponse> getCourseMembers(UUID courseId) {
        Course course = getCourseById(courseId); // validate
        List<ClassMember> members = classMemberRepository.findByClassId(courseId);
        List<UUID> studentIds = members.stream().map(ClassMember::getStudentId).collect(Collectors.toList());
        
        if (studentIds.isEmpty()) return Collections.emptyList();

        Map<UUID, UserResponseDto> userMap = fetchUsersBatch(studentIds);

        return members.stream().map(m -> {
            UserResponseDto user = userMap.get(m.getStudentId());
            return ClassMemberResponse.builder()
                    .studentId(m.getStudentId())
                    .name(user != null ? user.getFullName() : "Unknown Student")
                    .email(user != null ? user.getEmail() : "")
                    .role("Thành viên")
                    .build();
        }).collect(Collectors.toList());
    }

    private List<Course> populateTeacherNames(List<Course> courses) {
        if (courses.isEmpty()) return courses;
        
        List<UUID> teacherIds = courses.stream()
                .map(Course::getTeacherId)
                .distinct()
                .collect(Collectors.toList());
                
        Map<UUID, UserResponseDto> userMap = fetchUsersBatch(teacherIds);
        
        for (Course course : courses) {
            UserResponseDto teacher = userMap.get(course.getTeacherId());
            if (teacher != null) {
                course.setTeacherName(teacher.getFullName());
            }
        }
        return courses;
    }

    private Map<UUID, UserResponseDto> fetchUsersBatch(List<UUID> userIds) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<List<UUID>> requestEntity = new HttpEntity<>(userIds, headers);
            
            ResponseEntity<ApiResponseDto<List<UserResponseDto>>> response = restTemplate.exchange(
                    identityServiceUrl + "/api/users/batch",
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<ApiResponseDto<List<UserResponseDto>>>() {}
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData().stream()
                        .collect(Collectors.toMap(UserResponseDto::getId, Function.identity()));
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(CourseService.class).warn("Failed to fetch users from identity-service: {}", e.getMessage());
        }
        return Collections.emptyMap();
    }
}
