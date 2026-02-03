package com.eventmanagement.dto;

import com.eventmanagement.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private String phoneNumber;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
