package com.eventmanagement.dto;

import com.eventmanagement.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String email;
    private UserRole role;
    private Long userId;
    private String firstName;
    private String lastName;
}
