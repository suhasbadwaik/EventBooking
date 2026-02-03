package com.eventmanagement.repository;

import com.eventmanagement.entity.Booking;
import com.eventmanagement.entity.BookingStatus;
import com.eventmanagement.entity.User;
import com.eventmanagement.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByCustomer(User customer);
    
    List<Booking> findByVenue(Venue venue);
    
    List<Booking> findByCustomerAndStatus(User customer, BookingStatus status);
    
    Optional<Booking> findByRazorpayOrderId(String razorpayOrderId);
    
    Optional<Booking> findByRazorpayPaymentId(String razorpayPaymentId);
    
    @Query("SELECT b FROM Booking b WHERE b.venue = :venue AND " +
           "b.status IN ('PENDING', 'CONFIRMED') AND " +
           "((b.startTime <= :endTime AND b.endTime >= :startTime))")
    List<Booking> findConflictingBookings(@Param("venue") Venue venue,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);
}
