package com.codecheckhub.submission.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.notification}")
    private String notificationRoutingKey;

    public void sendNotification(Map<String, Object> payload) {
        log.info("Sending notification for submission {} to notification queue", payload.get("submissionId"));
        rabbitTemplate.convertAndSend(exchange, notificationRoutingKey, payload);
    }
}
