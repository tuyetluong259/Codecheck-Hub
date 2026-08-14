package com.codecheckhub.submission.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubmissionProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.judge}")
    private String judgeRoutingKey;

    public void sendToJudge(JudgeRequest request) {
        log.info("Sending submission {} to judge queue", request.getSubmissionId());
        rabbitTemplate.convertAndSend(exchange, judgeRoutingKey, request);
    }
}
