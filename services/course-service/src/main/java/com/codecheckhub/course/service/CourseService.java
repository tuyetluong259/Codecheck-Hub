package com.codecheckhub.course.service;

import com.codecheckhub.course.dto.CreateCourseRequest;
import com.codecheckhub.course.dto.CourseResponse;
import com.codecheckhub.course.dto.SyncStudentRequest;
import com.codecheckhub.course.dto.UpdateCourseRequest;
import com.codecheckhub.course.dto.UserResponse;
import com.codecheckhub.course.dto.ApiResponse;
import com.codecheckhub.course.entity.Course;
import com.codecheckhub.course.entity.ClassMember;
import com.codecheckhub.course.entity.Problem;
import com.codecheckhub.course.repository.CourseRepository;
import com.codecheckhub.course.repository.ClassMemberRepository;
import com.codecheckhub.course.repository.ProblemRepository;
import com.codecheckhub.course.dto.AnalyticsResponse;
import com.codecheckhub.course.dto.DashboardStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;

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

    private HttpEntity<Void> createAuthEntity() {
        HttpHeaders headers = new HttpHeaders();
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            String authHeader = attributes.getRequest().getHeader("Authorization");
            if (authHeader != null) {
                headers.set("Authorization", authHeader);
            }
        }
        return new HttpEntity<>(headers);
    }

    private CourseResponse mapToResponse(Course course) {
        String teacherName = "Giảng viên";
        try {
            String url = identityServiceUrl + "/api/users/" + course.getTeacherId();
            ResponseEntity<ApiResponse<UserResponse>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    createAuthEntity(),
                    new ParameterizedTypeReference<ApiResponse<UserResponse>>() {}
            );
            if (response.getBody() != null && response.getBody().isSuccess() && response.getBody().getData() != null) {
                teacherName = response.getBody().getData().getFullName();
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(CourseService.class).warn("Failed to fetch teacher name: {}", e.getMessage());
        }

        return CourseResponse.builder()
                .id(course.getId())
                .name(course.getName())
                .code(course.getCode())
                .description(course.getDescription())
                .teacherId(course.getTeacherId())
                .teacherName(teacherName)
                .syllabus(course.getSyllabus())
                .passingCriteria(course.getPassingCriteria())
                .allowJoinByCode(course.isAllowJoinByCode())
                .active(course.isActive())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    @Transactional
    public CourseResponse updateCourse(UUID id, com.codecheckhub.course.dto.UpdateCourseRequest request) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        if (request.getName() != null) course.setName(request.getName());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getSyllabus() != null) course.setSyllabus(request.getSyllabus());
        if (request.getPassingCriteria() != null) course.setPassingCriteria(request.getPassingCriteria());
        if (request.getAllowJoinByCode() != null) course.setAllowJoinByCode(request.getAllowJoinByCode());
        return mapToResponse(courseRepository.save(course));
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CourseResponse> getCoursesByTeacherId(UUID teacherId) {
        return courseRepository.findByTeacherId(teacherId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CourseResponse> getCoursesByStudentId(UUID studentId) {
        List<ClassMember> memberships = classMemberRepository.findByStudentId(studentId);
        return memberships.stream()
                .map(m -> courseRepository.findById(m.getClassId()).orElse(null))
                .filter(c -> c != null)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return mapToResponse(course);
    }

    public List<UserResponse> getCourseMembers(UUID courseId) {
        List<ClassMember> memberships = classMemberRepository.findByClassId(courseId);
        return memberships.stream().map(m -> {
            UserResponse user = null;
            try {
                String url = identityServiceUrl + "/api/users/" + m.getStudentId();
                ResponseEntity<ApiResponse<UserResponse>> response = restTemplate.exchange(
                        url, HttpMethod.GET, createAuthEntity(), new ParameterizedTypeReference<ApiResponse<UserResponse>>() {}
                );
                if (response.getBody() != null && response.getBody().isSuccess()) {
                    user = response.getBody().getData();
                }
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(CourseService.class).warn("Failed to fetch student details: {}", e.getMessage());
            }
            if (user == null) {
                user = UserResponse.builder().id(m.getStudentId()).fullName("Student " + m.getStudentId().toString().substring(0,4)).build();
            }
            return user;
        }).collect(Collectors.toList());
    }

    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request, UUID teacherId) {
        if (courseRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Course code already exists");
        }
        Course course = Course.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .teacherId(teacherId)
                .build();
        return mapToResponse(courseRepository.save(course));
    }

    @Transactional
    public void enrollStudent(UUID courseId, UUID studentId) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
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
    public int importMembers(UUID courseId, org.springframework.web.multipart.MultipartFile file) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        List<SyncStudentRequest> studentsToSync = new java.util.ArrayList<>();
        try {
            if (file.getOriginalFilename() != null && file.getOriginalFilename().endsWith(".csv")) {
                java.io.Reader reader = new java.io.InputStreamReader(file.getInputStream());
                org.apache.commons.csv.CSVParser csvParser = new org.apache.commons.csv.CSVParser(reader, org.apache.commons.csv.CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).build());
                for (org.apache.commons.csv.CSVRecord record : csvParser) {
                    studentsToSync.add(SyncStudentRequest.builder()
                            .studentId(record.get("MSSV"))
                            .fullName(record.get("Họ và tên"))
                            .email(record.isSet("Email") ? record.get("Email") : null)
                            .className(record.isSet("Lớp sinh hoạt") ? record.get("Lớp sinh hoạt") : null)
                            .build());
                }
            } else if (file.getOriginalFilename() != null && file.getOriginalFilename().endsWith(".xlsx")) {
                org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(file.getInputStream());
                org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
                boolean isFirstRow = true;
                for (org.apache.poi.ss.usermodel.Row row : sheet) {
                    if (isFirstRow) {
                        isFirstRow = false;
                        continue;
                    }
                    if (row.getCell(1) == null) break; // Assuming column 1 is MSSV, 0 is STT
                    String mssv = row.getCell(1).getStringCellValue();
                    String fullName = row.getCell(2) != null ? row.getCell(2).getStringCellValue() : "";
                    String email = row.getCell(3) != null ? row.getCell(3).getStringCellValue() : "";
                    String className = row.getCell(4) != null ? row.getCell(4).getStringCellValue() : "";
                    studentsToSync.add(SyncStudentRequest.builder()
                            .studentId(mssv)
                            .fullName(fullName)
                            .email(email)
                            .className(className)
                            .build());
                }
                workbook.close();
            } else {
                throw new RuntimeException("Unsupported file format");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse file: " + e.getMessage());
        }

        // Call Identity Service to sync
        try {
            String url = identityServiceUrl + "/api/users/internal/sync-students";
            ResponseEntity<ApiResponse<List<UUID>>> response = restTemplate.exchange(
                    url, HttpMethod.POST, new HttpEntity<>(studentsToSync, createAuthEntity().getHeaders()),
                    new ParameterizedTypeReference<ApiResponse<List<UUID>>>() {}
            );
            if (response.getBody() != null && response.getBody().isSuccess()) {
                List<UUID> studentIds = response.getBody().getData();
                int added = 0;
                for (UUID sId : studentIds) {
                    if (classMemberRepository.findByClassIdAndStudentId(courseId, sId).isEmpty()) {
                        classMemberRepository.save(ClassMember.builder().classId(courseId).studentId(sId).build());
                        added++;
                    }
                }
                return added;
            } else {
                throw new RuntimeException("Identity service failed to sync students");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to sync students with identity service: " + e.getMessage());
        }
    }

    @Transactional
    public void joinCourseByCode(String code, UUID studentId) {
        Course course = courseRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Class code not found"));
        
        if (!course.isAllowJoinByCode()) {
            throw new RuntimeException("This course does not allow joining by code");
        }

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
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        
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
        
        long recentPlagiarismAlerts = 0;
        
        return DashboardStatsResponse.builder()
                .totalCourses(totalCourses)
                .totalStudents(totalStudents)
                .totalProblems(totalProblems)
                .recentPlagiarismAlerts(recentPlagiarismAlerts)
                .build();
    }

    public DashboardStatsResponse getStudentDashboardStats(UUID studentId) {
        List<ClassMember> memberships = classMemberRepository.findByStudentId(studentId);
        List<UUID> courseIds = memberships.stream().map(ClassMember::getClassId).collect(Collectors.toList());
        long totalCourses = courseIds.size();
        long totalProblems = courseIds.isEmpty() ? 0 : problemRepository.findByCourseIdIn(courseIds).size();
        
        // Mocked stats for AC rate and completed problems as we don't have submission-service integration for this yet
        // A complete implementation would call submission-service to get the actual AC count.
        long completedProblems = Math.max(0, totalProblems / 2); // Dummy calculation for now
        
        return DashboardStatsResponse.builder()
                .totalCourses(totalCourses)
                .totalStudents(0) // Not applicable for student
                .totalProblems(totalProblems)
                .recentPlagiarismAlerts(0)
                .build();
    }
}
