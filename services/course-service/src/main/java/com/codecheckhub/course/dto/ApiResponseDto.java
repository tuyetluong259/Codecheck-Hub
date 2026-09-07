package com.codecheckhub.course.dto;

import lombok.Data;

@Data
public class ApiResponseDto<T> {
    private T data;
    private String message;
    private String error;
}
