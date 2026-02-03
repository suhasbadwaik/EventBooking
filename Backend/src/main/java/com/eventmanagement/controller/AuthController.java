package com.eventmanagement.controller;

import com.eventmanagement.dto.LoginRequest;
import com.eventmanagement.dto.LoginResponse;
import com.eventmanagement.dto.UserRequest;
import com.eventmanagement.dto.UserResponse;
import com.eventmanagement.serviceimplementaion.AuthServiceImpl;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthServiceImpl authService;
    
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
