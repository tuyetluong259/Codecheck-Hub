package com.codecheckhub.notification.dto;

import lombok.Data;

@Data
public class CreateNotificationRequest {
    private String userId;
    private String type;
    private String title;
    private String message;
}
