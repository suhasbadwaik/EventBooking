package com.eventmanagement.serviceimplementaion;

import com.eventmanagement.dto.BookingRequest;
import com.eventmanagement.dto.BookingResponse;
import com.eventmanagement.entity.Availability;
import com.eventmanagement.entity.AvailabilityStatus;
import com.eventmanagement.entity.Booking;
import com.eventmanagement.entity.BookingStatus;
import com.eventmanagement.entity.User;
import com.eventmanagement.entity.UserRole;
import com.eventmanagement.entity.Venue;
import com.eventmanagement.repository.AvailabilityRepository;
import com.eventmanagement.repository.BookingRepository;
import com.eventmanagement.repository.VenueRepository;
import com.eventmanagement.service.BookingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService{
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private AvailabilityRepository availabilityRepository;
    
    @Autowired
    private VenueRepository venueRepository;
    
    @Autowired
    private UserServiceImpl userService;
    
    @Autowired
    private RazorpayServiceImpl razorpayService;
    
    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long customerId) {
        User customer = userService.findById(customerId);
        
        Availability availability = availabilityRepository.findById(request.getAvailabilityId())
            .orElseThrow(() -> new RuntimeException("Availability not found with id: " + request.getAvailabilityId()));
        
        // Business validations
        if (availability.getStatus() != AvailabilityStatus.AVAILABLE) {
            throw new RuntimeException("This slot is not available for booking");
        }
        
        if (availability.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book a past slot");
        }
        
        Venue venue = availability.getVenue();
        
        // Calculate total amount
        Duration duration = Duration.between(availability.getStartTime(), availability.getEndTime());
        long hours = duration.toHours();
        if (duration.toMinutes() % 60 > 0) {
            hours++; // Round up to next hour
        }
        Double totalAmount = venue.getPricePerHour() * hours;
        
        // Create booking
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setVenue(venue);
        booking.setAvailability(availability);
        booking.setStartTime(availability.getStartTime());
        booking.setEndTime(availability.getEndTime());
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.PENDING);
        
        booking = bookingRepository.save(booking);
        
        // Mark availability as booked
        availability.setStatus(AvailabilityStatus.BOOKED);
        availabilityRepository.save(availability);
        
        // Create Razorpay order
        try {
            String orderId = razorpayService.createOrder(totalAmount, booking.getId());
            booking.setRazorpayOrderId(orderId);
            booking = bookingRepository.save(booking);
        } catch (Exception e) {
            // If payment order creation fails, still keep the booking but mark it appropriately
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        }
        
        return mapToBookingResponse(booking);
    }
    
    @Transactional
    public BookingResponse confirmPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        Booking booking = bookingRepository.findByRazorpayOrderId(razorpayOrderId)
            .orElseThrow(() -> new RuntimeException("Booking not found with order ID: " + razorpayOrderId));
        
        // Verify payment signature
        boolean isValid = razorpayService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        
        if (isValid) {
            booking.setRazorpayPaymentId(razorpayPaymentId);
            booking.setPaymentStatus("SUCCESS");
            booking.setStatus(BookingStatus.CONFIRMED);
            booking = bookingRepository.save(booking);
        } else {
            booking.setPaymentStatus("FAILED");
            booking.setStatus(BookingStatus.CANCELLED);
            
            // Release the availability slot
            Availability availability = booking.getAvailability();
            availability.setStatus(AvailabilityStatus.AVAILABLE);
            availabilityRepository.save(availability);
            
            booking = bookingRepository.save(booking);
            throw new RuntimeException("Payment verification failed");
        }
        
        return mapToBookingResponse(booking);
    }
    
    @Transactional
    public void cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        
        // Check if user has permission (customer who made booking or admin)
        User currentUser = userService.findById(userId);
        if (!booking.getCustomer().getId().equals(userId) && currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to cancel this booking");
        }
        
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a booking that is already cancelled or completed");
        }
        
        // Release availability
        Availability availability = booking.getAvailability();
        availability.setStatus(AvailabilityStatus.AVAILABLE);
        availabilityRepository.save(availability);
        
        // Update booking status
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
    
    public List<BookingResponse> getBookingsByCustomer(Long customerId) {
        User customer = userService.findById(customerId);
        return bookingRepository.findByCustomer(customer).stream()
            .map(this::mapToBookingResponse)
            .collect(Collectors.toList());
    }
    
    public List<BookingResponse> getBookingsByVenue(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
            .orElseThrow(() -> new RuntimeException("Venue not found with id: " + venueId));
        return bookingRepository.findByVenue(venue).stream()
            .map(this::mapToBookingResponse)
            .collect(Collectors.toList());
    }
    
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        return mapToBookingResponse(booking);
    }
    
    private BookingResponse mapToBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setCustomerId(booking.getCustomer().getId());
        response.setCustomerName(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName());
        response.setVenueId(booking.getVenue().getId());
        response.setVenueName(booking.getVenue().getName());
        response.setAvailabilityId(booking.getAvailability().getId());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setTotalAmount(booking.getTotalAmount());
        response.setStatus(booking.getStatus());
        response.setRazorpayOrderId(booking.getRazorpayOrderId());
        response.setPaymentStatus(booking.getPaymentStatus());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}
