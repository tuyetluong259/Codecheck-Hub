package com.codecheckhub.judge.config;

import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    @Bean
    public MessageConverter messageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        DefaultClassMapper classMapper = new DefaultClassMapper();
        classMapper.setTrustedPackages("*");
        
        Map<String, Class<?>> idClassMapping = new HashMap<>();
        idClassMapping.put("com.codecheckhub.submission.messaging.JudgeRequest", com.codecheckhub.judge.messaging.JudgeRequest.class);
        classMapper.setIdClassMapping(idClassMapping);
        
        converter.setClassMapper(classMapper);
        return converter;
    }
}
