package com.eventmanagement.repository;

import com.eventmanagement.entity.User;
import com.eventmanagement.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    
    List<Venue> findByOwner(User owner);
    
    List<Venue> findByOwnerAndActive(User owner, boolean active);
    
    List<Venue> findByActive(boolean active);
    
    @Query("SELECT v FROM Venue v WHERE v.active = true AND " +
           "(:city IS NULL OR LOWER(v.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(v.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(v.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Venue> searchVenues(@Param("city") String city, 
                             @Param("searchTerm") String searchTerm);
}
