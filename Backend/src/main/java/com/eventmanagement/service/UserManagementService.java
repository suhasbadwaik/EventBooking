package com.eventmanagement.service;

import com.eventmanagement.dto.UserRequest;
import com.eventmanagement.dto.UserResponse;
import com.eventmanagement.entity.UserRole;

import java.util.List;

public interface UserManagementService {

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);

    UserResponse getUserById(Long id);

    List<UserResponse> getAllUsers();

    List<UserResponse> searchUsers(String searchTerm, UserRole role);
}
