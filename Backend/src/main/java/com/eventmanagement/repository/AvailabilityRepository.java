package com.eventmanagement.repository;

import com.eventmanagement.entity.Availability;
import com.eventmanagement.entity.AvailabilityStatus;
import com.eventmanagement.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    
    List<Availability> findByVenue(Venue venue);
    
    List<Availability> findByVenueAndStatus(Venue venue, AvailabilityStatus status);
    
    @Query("SELECT a FROM Availability a WHERE a.venue = :venue AND " +
           "a.status = 'AVAILABLE' AND a.startTime >= :now " +
           "ORDER BY a.startTime ASC")
    List<Availability> findAvailableSlotsByVenue(@Param("venue") Venue venue, 
                                                  @Param("now") LocalDateTime now);
    
    @Query("SELECT a FROM Availability a WHERE a.venue = :venue AND " +
           "a.startTime >= :startTime AND a.endTime <= :endTime")
    List<Availability> findByVenueAndTimeRange(@Param("venue") Venue venue,
                                               @Param("startTime") LocalDateTime startTime,
                                               @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT a FROM Availability a WHERE a.venue.id = :venueId AND " +
           "a.status = 'AVAILABLE' AND a.startTime >= :now " +
           "ORDER BY a.startTime ASC")
    List<Availability> findAvailableSlotsByVenueId(@Param("venueId") Long venueId, 
                                                    @Param("now") LocalDateTime now);
    
    Optional<Availability> findByIdAndStatus(Long id, AvailabilityStatus status);
}
