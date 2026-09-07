package com.codecheckhub.course.service;

import com.codecheckhub.course.entity.Course;
import com.codecheckhub.course.entity.Problem;
import com.codecheckhub.course.repository.ClassMemberRepository;
import com.codecheckhub.course.repository.CourseRepository;
import com.codecheckhub.course.repository.ProblemRepository;
import com.codecheckhub.course.dto.SubmissionProgressDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CronJobService {

    private final ProblemRepository problemRepository;
    private final CourseRepository courseRepository;
    private final ClassMemberRepository classMemberRepository;
    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:8085}")
    private String notificationServiceUrl;

    @Value("${submission.service.url:http://localhost:8083}")
    private String submissionServiceUrl;

    // Chạy mỗi 5 phút
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkExpiredProblems() {
        log.info("Running cron job to check expired problems...");
        LocalDateTime now = LocalDateTime.now();

        // Tìm các bài tập đã qua deadline nhưng chưa được notify
        List<Problem> expiredProblems = problemRepository.findByDeadlineBeforeAndIsClosedNotifiedFalse(now);
        
        if (expiredProblems.isEmpty()) {
            return;
        }

        log.info("Found {} expired problems to notify", expiredProblems.size());

        for (Problem problem : expiredProblems) {
            try {
                notifyLecturerAboutExpiredProblem(problem);
                // Mark as notified
                problem.setIsClosedNotified(true);
                problemRepository.save(problem);
            } catch (Exception e) {
                log.error("Failed to process expired problem {}", problem.getId(), e);
            }
        }
    }

    private void notifyLecturerAboutExpiredProblem(Problem problem) {
        Course course = courseRepository.findById(problem.getCourseId()).orElse(null);
        if (course == null) return;

        // Lấy tổng số SV trong lớp
        long totalStudents = classMemberRepository.findByClassId(course.getId()).size();

        // Gọi sang submission service lấy số lượng nộp bài
        long submittedCount = 0;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<List<UUID>> requestEntity = new HttpEntity<>(Collections.singletonList(problem.getId()), headers);
            
            ResponseEntity<List<SubmissionProgressDto>> response = restTemplate.exchange(
                    submissionServiceUrl + "/api/submissions/lecturer/progress",
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<List<SubmissionProgressDto>>() {}
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
                submittedCount = response.getBody().get(0).getDistinctStudentCount();
            }
        } catch (Exception e) {
            log.warn("Could not fetch progress for expired problem {}", problem.getId());
        }

        double percentage = totalStudents == 0 ? 0 : ((double) submittedCount / totalStudents) * 100;

        // Tạo message cho Giảng viên
        String message = String.format("Bài tập '%s' đã kết thúc thời gian nộp bài. Tổng kết: %d/%d sinh viên đã hoàn thành (Tỷ lệ: %.1f%%).", 
                problem.getTitle(), submittedCount, totalStudents, percentage);

        // Gửi sang notification-service (sử dụng teacherId)
        Map<String, String> request = new HashMap<>();
        request.put("userId", course.getTeacherId().toString());
        request.put("type", "ASSIGNMENT_CLOSED");
        request.put("title", "Assignment Closed");
        request.put("message", message);

        try {
            restTemplate.postForEntity(
                    notificationServiceUrl + "/api/notifications",
                    request,
                    Void.class
            );
        } catch (Exception e) {
            log.error("Failed to send notification to teacher {}", course.getTeacherId(), e);
        }
    }
}
