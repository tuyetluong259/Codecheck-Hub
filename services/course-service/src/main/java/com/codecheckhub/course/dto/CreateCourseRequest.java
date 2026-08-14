package com.codecheckhub.course.dto;

import lombok.Data;

@Data
public class CreateCourseRequest {
    private String name;
    private String code;
    private String description;
}
