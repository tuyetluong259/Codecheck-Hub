package com.codecheckhub.course.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActivityDto {
    private String name;
    private String cls;
    private String msg;
    private String time;
}
