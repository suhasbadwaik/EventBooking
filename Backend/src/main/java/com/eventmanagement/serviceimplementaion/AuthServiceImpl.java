package com.eventmanagement.serviceimplementaion;

import com.eventmanagement.dto.LoginRequest;
import com.eventmanagement.dto.LoginResponse;
import com.eventmanagement.dto.UserRequest;
import com.eventmanagement.dto.UserResponse;
import com.eventmanagement.entity.User;
import com.eventmanagement.entity.UserRole;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.service.AuthService;
import com.eventmanagement.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService{
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Transactional
    public UserResponse register(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setActive(true);
        
        user = userRepository.save(user);
        return mapToUserResponse(user);
    }
    
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.isActive()) {
            throw new RuntimeException("User account is inactive");
        }
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setUserId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        
        return response;
    }
    
    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
