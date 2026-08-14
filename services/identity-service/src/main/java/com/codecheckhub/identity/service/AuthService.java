package com.codecheckhub.identity.service;

import com.codecheckhub.identity.dto.request.LoginRequest;
import com.codecheckhub.identity.dto.request.RegisterRequest;
import com.codecheckhub.identity.dto.response.AuthResponse;
import com.codecheckhub.identity.entity.RefreshToken;
import com.codecheckhub.identity.entity.User;
import com.codecheckhub.identity.exception.AppException;
import com.codecheckhub.identity.repository.RefreshTokenRepository;
import com.codecheckhub.identity.repository.UserRepository;
import com.codecheckhub.identity.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(HttpStatus.CONFLICT, "Username already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .studentId(request.getStudentId())
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getUsername());

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        // Revoke old refresh tokens
        refreshTokenRepository.revokeAllByUser(user);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (storedToken.isRevoked() || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked");
        }

        User user = storedToken.getUser();
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        return generateAuthResponse(user);
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(refreshTokenRepository::revokeAllByUser);
    }

    private AuthResponse generateAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());

        String accessToken = jwtTokenProvider.generateAccessToken(
                userDetails, user.getId().toString(), user.getRole().name()
        );
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        RefreshToken tokenEntity = RefreshToken.builder()
                .token(newRefreshToken)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .build();
        refreshTokenRepository.save(tokenEntity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .user(com.codecheckhub.identity.dto.response.UserResponse.from(user))
                .build();
    }
}
