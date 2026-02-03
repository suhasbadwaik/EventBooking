package com.eventmanagement.service;

import com.eventmanagement.entity.User;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {

    User findByEmail(String email);

    User findById(Long id);
}
