package com.eventmanagement.repository;

import com.eventmanagement.entity.User;
import com.eventmanagement.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(UserRole role);
    
    @Query("SELECT u FROM User u WHERE " +
           "(:searchTerm IS NULL OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND (:role IS NULL OR u.role = :role)")
    List<User> searchUsers(@Param("searchTerm") String searchTerm, 
                           @Param("role") UserRole role);
}
