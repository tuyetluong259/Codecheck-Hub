package com.codecheckhub.course.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserResponseDto {
    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String role;
}
