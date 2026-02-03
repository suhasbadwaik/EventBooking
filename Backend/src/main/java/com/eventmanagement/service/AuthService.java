package com.eventmanagement.service;

import com.eventmanagement.dto.LoginRequest;
import com.eventmanagement.dto.LoginResponse;
import com.eventmanagement.dto.UserRequest;
import com.eventmanagement.dto.UserResponse;

public interface AuthService {

    UserResponse register(UserRequest request);

    LoginResponse login(LoginRequest request);
}
