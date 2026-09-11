package com.codecheckhub.notification.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import com.codecheckhub.notification.entity.Notification;
import com.codecheckhub.notification.service.NotificationService;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResultConsumer {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Value("${rabbitmq.queue.notification}")
    private String notificationQueue;

    /**
     * Consume kết quả từ RabbitMQ và push qua WebSocket đến client
     * Client subscribe: /topic/submission/{submissionId}
     *
     * BUG FIX: nhận Map<String,Object> trực tiếp — Jackson2JsonMessageConverter
     * trong notification-service cần được config (xem bên dưới)
     */
    @RabbitListener(queues = "${rabbitmq.queue.notification}")
    public void handleResult(Map<String, Object> result) {
        try {
            if (result == null || !result.containsKey("submissionId")) {
                log.warn("Received null or invalid result message");
                return;
            }
            String submissionId = result.get("submissionId").toString();

            log.info("Pushing result for submission {} via WebSocket", submissionId);

            // Push đến topic cụ thể cho submission này
            messagingTemplate.convertAndSend(
                    "/topic/submission/" + submissionId,
                    result
            );

            // Cũng push đến user queue nếu biết studentId
            if (result.containsKey("studentId") && result.get("studentId") != null) {
                String studentId = result.get("studentId").toString();
                
                // 1. Lưu vào Database
                String status = result.containsKey("status") ? result.get("status").toString() : "UNKNOWN";
                if (!"TEST_RUN".equals(status)) {
                    String message = "Your submission for " + submissionId + " was graded: " + status;
                    if (result.containsKey("score")) {
                        message += ". Score: " + result.get("score");
                    }
                    Notification notif = notificationService.saveNotification(
                            studentId,
                            "SUBMISSION_RESULT",
                            "Submission Graded",
                            message
                    );
                    // Add the notification ID to the payload for the frontend
                    result.put("notificationId", notif.getId());
                }

                // 2. Push qua WebSocket
                messagingTemplate.convertAndSend(
                        "/queue/student/" + studentId,
                        result
                );
            }

        } catch (Exception e) {
            log.error("Failed to process result message: {}", e.getMessage(), e);
        }
    }
}
