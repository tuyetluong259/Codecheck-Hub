package com.codecheckhub.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * BUG FIX: notification-service cần RabbitMQ config riêng để
 * deserialize message từ JSON sang Map<String, Object>
 */
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.queue.result}")
    private String resultQueue;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.result}")
    private String resultRoutingKey;

    @Bean
    public Queue notificationResultQueue() {
        return QueueBuilder.durable(resultQueue).build();
    }

    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(exchange);
    }

    @Bean
    public Binding notificationResultBinding(Queue notificationResultQueue,
                                              DirectExchange notificationExchange) {
        return BindingBuilder.bind(notificationResultQueue)
                .to(notificationExchange)
                .with(resultRoutingKey);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory factory) {
        RabbitTemplate template = new RabbitTemplate(factory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
