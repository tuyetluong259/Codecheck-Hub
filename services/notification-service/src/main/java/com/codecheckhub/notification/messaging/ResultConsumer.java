package com.codecheckhub.notification.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResultConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    @Value("${rabbitmq.queue.result}")
    private String resultQueue;

    /**
     * Consume kết quả từ RabbitMQ và push qua WebSocket đến client
     * Client subscribe: /topic/submission/{submissionId}
     *
     * BUG FIX: nhận Map<String,Object> trực tiếp — Jackson2JsonMessageConverter
     * trong notification-service cần được config (xem bên dưới)
     */
    @RabbitListener(queues = "${rabbitmq.queue.result}")
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
