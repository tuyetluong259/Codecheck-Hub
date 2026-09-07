package com.codecheckhub.course.dto;

import lombok.Data;

@Data
public class UpdateCourseRequest {
    private String name;
    private String description;
    private String syllabus;
    private String passingCriteria;
    private Boolean allowJoinByCode;
}
