package com.codecheckhub.identity.service;

import com.codecheckhub.identity.dto.response.UserResponse;
import com.codecheckhub.identity.entity.User;
import com.codecheckhub.identity.exception.AppException;
import com.codecheckhub.identity.repository.UserRepository;
import com.codecheckhub.identity.repository.RefreshTokenRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final StringRedisTemplate redisTemplate;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

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

    public List<UserResponse> getUsersBatch(List<UUID> ids) {
        return userRepository.findAllById(ids).stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse updateProfile(String email, String fullName, String avatarUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
        user.setFullName(fullName);
        if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse toggleUserStatus(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getStatus() == User.Status.ACTIVE || user.getStatus() == User.Status.PENDING) {
            user.setStatus(User.Status.LOCKED);
            refreshTokenRepository.revokeAllByUser(user);
            redisTemplate.opsForValue().set("blacklist:user:" + user.getId(), "true", java.time.Duration.ofMinutes(15));
        } else {
            user.setStatus(User.Status.ACTIVE);
            redisTemplate.delete("blacklist:user:" + user.getId());
        }
        userRepository.save(user);
        auditLogService.log("INFO", "Toggled status of user " + user.getUsername() + " to " + user.getStatus(), "Admin", null);
        return UserResponse.from(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
        refreshTokenRepository.deleteAllByUser(user);
        userRepository.deleteById(id);
        auditLogService.log("WARNING", "Deleted user " + user.getUsername(), "Admin", null);
    }

    public UserResponse createUser(String username, String email, String fullName, String roleStr, String password) {
        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Username or email already exists");
        }
        User.Role role = User.Role.STUDENT;
        try {
            if (roleStr != null && !roleStr.isBlank()) {
                role = User.Role.valueOf(roleStr.trim().toUpperCase());
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid role received: " + roleStr + ", defaulting to STUDENT");
            // keep default
        }
        User user = User.builder()
                .username(username)
                .email(email)
                .fullName(fullName)
                .password(passwordEncoder.encode(password))
                .studentId(username)
                .role(role)
                .status(User.Status.ACTIVE)
                .build();
        userRepository.save(user);
        auditLogService.log("INFO", "Created new user " + user.getUsername() + " with role " + user.getRole(), "Admin", null);
        return UserResponse.from(user);
    }

    public int importUsers(MultipartFile file) {
        List<User> newUsers = new ArrayList<>();
        try {
            if (file.getOriginalFilename() != null && file.getOriginalFilename().endsWith(".csv")) {
                Reader reader = new InputStreamReader(file.getInputStream());
                CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).build());
                for (CSVRecord record : csvParser) {
                    newUsers.add(parseUserRecord(
                            record.get("studentId"),
                            record.get("fullName"),
                            record.get("dateOfBirth"),
                            record.isSet("email") ? record.get("email") : null
                    ));
                }
            } else if (file.getOriginalFilename() != null && file.getOriginalFilename().endsWith(".xlsx")) {
                Workbook workbook = new XSSFWorkbook(file.getInputStream());
                Sheet sheet = workbook.getSheetAt(0);
                boolean isFirstRow = true;
                for (Row row : sheet) {
                    if (isFirstRow) {
                        isFirstRow = false;
                        continue;
                    }
                    if (row.getCell(0) == null) break;
                    String studentId = row.getCell(0).getStringCellValue();
                    String fullName = row.getCell(1).getStringCellValue();
                    String dob = row.getCell(2).getStringCellValue();
                    String email = (row.getCell(3) != null) ? row.getCell(3).getStringCellValue() : "";
                    newUsers.add(parseUserRecord(studentId, fullName, dob, email));
                }
                workbook.close();
            } else {
                throw new AppException(HttpStatus.BAD_REQUEST, "Unsupported file format. Please upload .csv or .xlsx");
            }

            List<User> validUsers = newUsers.stream().filter(u -> u != null).toList();
            userRepository.saveAll(validUsers);
            return validUsers.size();

        } catch (Exception e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Error parsing file: " + e.getMessage());
        }
    }

    private User parseUserRecord(String studentId, String fullName, String dob, String email) {
        if (studentId == null || studentId.isBlank()) return null;
        
        String username = studentId.trim();
        String finalEmail = (email == null || email.isBlank()) ? username + "@st.uth.edu.vn" : email.trim();
        
        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(finalEmail)) {
            return null; // Skip duplicates
        }

        String password = dob != null && !dob.isBlank() ? dob.trim() : "123456";

        return User.builder()
                .username(username)
                .email(finalEmail)
                .fullName(fullName != null ? fullName.trim() : username)
                .password(passwordEncoder.encode(password))
                .studentId(username)
                .role(User.Role.STUDENT)
                .status(User.Status.PENDING)
                .build();
    }

    public List<UUID> syncStudents(List<com.codecheckhub.identity.dto.request.SyncStudentRequest> students) {
        List<UUID> userIds = new ArrayList<>();
        List<User> newUsersToSave = new ArrayList<>();

        for (var req : students) {
            String studentId = req.getStudentId();
            if (studentId == null || studentId.isBlank()) continue;
            
            String username = studentId.trim();
            String email = req.getEmail();
            String finalEmail = (email == null || email.isBlank()) ? username + "@st.uth.edu.vn" : email.trim();

            User existingUser = userRepository.findByUsername(username)
                    .orElseGet(() -> userRepository.findByEmail(finalEmail).orElse(null));

            if (existingUser != null) {
                userIds.add(existingUser.getId());
            } else {
                User newUser = User.builder()
                        .username(username)
                        .email(finalEmail)
                        .fullName(req.getFullName() != null && !req.getFullName().isBlank() ? req.getFullName().trim() : username)
                        .password(passwordEncoder.encode(username)) // default password is username/mssv
                        .studentId(username)
                        .role(User.Role.STUDENT)
                        .status(User.Status.PENDING)
                        .className(req.getClassName())
                        .build();
                newUsersToSave.add(newUser);
            }
        }

        if (!newUsersToSave.isEmpty()) {
            userRepository.saveAll(newUsersToSave);
            for (User u : newUsersToSave) {
                userIds.add(u.getId());
            }
        }

        return userIds;
    }
}
