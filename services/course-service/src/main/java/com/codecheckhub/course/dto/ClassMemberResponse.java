package com.codecheckhub.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassMemberResponse {
    private UUID studentId;
    private String name;
    private String email;
    private String role;
}
