package com.eventmanagement.security;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Separate configuration for PasswordEncoder to break circular dependency.
 * 
 * Why this is needed:
 * - SecurityConfig depends on UserService
 * - UserService needs PasswordEncoder (which was in SecurityConfig)
 * - This created a cycle: SecurityConfig → UserService → PasswordEncoder (from SecurityConfig) → back to SecurityConfig
 * 
 * Solution: Extract PasswordEncoder to a separate config class that has no dependencies,
 * breaking the cycle.
 */
@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}