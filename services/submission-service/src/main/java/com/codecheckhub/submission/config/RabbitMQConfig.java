package com.codecheckhub.submission.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.queue.judge}")
    private String judgeQueue;

    @Value("${rabbitmq.queue.result}")
    private String resultQueue;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.judge}")
    private String judgeRoutingKey;

    @Value("${rabbitmq.routing-key.result}")
    private String resultRoutingKey;

    @Value("${rabbitmq.queue.notification}")
    private String notificationQueue;

    @Value("${rabbitmq.routing-key.notification}")
    private String notificationRoutingKey;

    @Bean
    public Queue judgeQueue() {
        return QueueBuilder.durable(judgeQueue).build();
    }

    @Bean
    public Queue resultQueue() {
        return QueueBuilder.durable(resultQueue).build();
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(notificationQueue).build();
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(exchange);
    }

    @Bean
    public Binding judgeBinding(Queue judgeQueue, DirectExchange exchange) {
        return BindingBuilder.bind(judgeQueue).to(exchange).with(judgeRoutingKey);
    }

    @Bean
    public Binding resultBinding(Queue resultQueue, DirectExchange exchange) {
        return BindingBuilder.bind(resultQueue).to(exchange).with(resultRoutingKey);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(notificationQueue).to(exchange).with(notificationRoutingKey);
    }

    @Bean
    public MessageConverter messageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        DefaultClassMapper classMapper = new DefaultClassMapper();
        classMapper.setTrustedPackages("*");
        
        Map<String, Class<?>> idClassMapping = new HashMap<>();
        idClassMapping.put("com.codecheckhub.judge.messaging.JudgeResult", com.codecheckhub.submission.messaging.JudgeResult.class);
        classMapper.setIdClassMapping(idClassMapping);
        
        converter.setClassMapper(classMapper);
        return converter;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory factory) {
        RabbitTemplate template = new RabbitTemplate(factory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
