package com.codecheckhub.identity.service;

import com.codecheckhub.identity.dto.response.UserResponse;
import com.codecheckhub.identity.entity.User;
import com.codecheckhub.identity.exception.AppException;
import com.codecheckhub.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
        return UserResponse.from(user);
    }

    public UserResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
        return UserResponse.from(user);
    }

    public UserResponse updateProfile(String email, String fullName, String avatarUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
        user.setFullName(fullName);
        if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return UserResponse.from(user);
    }
}
