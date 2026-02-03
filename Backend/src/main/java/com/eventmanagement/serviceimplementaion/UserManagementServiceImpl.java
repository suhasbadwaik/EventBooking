package com.eventmanagement.serviceimplementaion;

import com.eventmanagement.dto.UserRequest;
import com.eventmanagement.dto.UserResponse;
import com.eventmanagement.entity.User;
import com.eventmanagement.entity.UserRole;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.service.UserManagementService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserManagementServiceImpl implements UserManagementService{
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Transactional
    public UserResponse createUser(UserRequest request) {
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
    
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setPhoneNumber(request.getPhoneNumber());
        
        user = userRepository.save(user);
        return mapToUserResponse(user);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
    
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToUserResponse(user);
    }
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::mapToUserResponse)
            .collect(Collectors.toList());
    }
    
    public List<UserResponse> searchUsers(String searchTerm, UserRole role) {
        return userRepository.searchUsers(searchTerm, role).stream()
            .map(this::mapToUserResponse)
            .collect(Collectors.toList());
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
