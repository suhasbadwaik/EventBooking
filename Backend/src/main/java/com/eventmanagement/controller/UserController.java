package com.eventmanagement.controller;

import com.eventmanagement.dto.UserRequest;
import com.eventmanagement.dto.UserResponse;
import com.eventmanagement.entity.UserRole;
import com.eventmanagement.serviceimplementaion.UserManagementServiceImpl;
import com.eventmanagement.serviceimplementaion.UserServiceImpl;
import com.eventmanagement.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserManagementServiceImpl userManagementService;
    
    @Autowired
    private UserServiceImpl userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private Long getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header is missing or invalid");
        }
        String token = authHeader.substring(7);
        return jwtUtil.getUserIdFromToken(token);
    }
    
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRequest request) {
        UserResponse response = userManagementService.createUser(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        UserResponse response = userManagementService.createUser(request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER', 'VENUE_OWNER')")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, 
                                                   @Valid @RequestBody UserRequest request,
                                                   HttpServletRequest httpRequest,
                                                   Authentication authentication) {
        // Check if user is admin or updating their own profile
        Long currentUserId = getUserIdFromRequest(httpRequest);
        
        // Allow if admin or updating own profile
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!isAdmin && !currentUserId.equals(id)) {
            throw new RuntimeException("You can only update your own profile");
        }
        
        UserResponse response = userManagementService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER', 'VENUE_OWNER')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id,
                                                     HttpServletRequest httpRequest,
                                                     Authentication authentication) {
        // Check if user is admin or viewing their own profile
        Long currentUserId = getUserIdFromRequest(httpRequest);
        
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!isAdmin && !currentUserId.equals(id)) {
            throw new RuntimeException("You can only view your own profile");
        }
        
        UserResponse response = userManagementService.getUserById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) UserRole role) {
        List<UserResponse> users;
        if (searchTerm != null || role != null) {
            users = userManagementService.searchUsers(searchTerm, role);
        } else {
            users = userManagementService.getAllUsers();
        }
        return ResponseEntity.ok(users);
    }
}
