package com.codecheckhub.submission.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
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

    @Bean
    public Queue judgeQueue() {
        return QueueBuilder.durable(judgeQueue).build();
    }

    @Bean
    public Queue resultQueue() {
        return QueueBuilder.durable(resultQueue).build();
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
