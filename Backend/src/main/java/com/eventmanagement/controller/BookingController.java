package com.eventmanagement.controller;

import com.eventmanagement.dto.BookingRequest;
import com.eventmanagement.dto.BookingResponse;
import com.eventmanagement.dto.PaymentRequest;
import com.eventmanagement.serviceimplementaion.BookingServiceImpl;
import com.eventmanagement.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    
    @Autowired
    private BookingServiceImpl bookingService;
    
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
    
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request,
                                                          HttpServletRequest httpRequest) {
        Long customerId = getUserIdFromRequest(httpRequest);
        BookingResponse response = bookingService.createBooking(request, customerId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/confirm-payment")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> confirmPayment(@Valid @RequestBody PaymentRequest request) {
        BookingResponse response = bookingService.confirmPayment(
            request.getRazorpayOrderId(),
            request.getRazorpayPaymentId(),
            request.getRazorpaySignature()
        );
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id,
                                               HttpServletRequest httpRequest) {
        Long userId = getUserIdFromRequest(httpRequest);
        bookingService.cancelBooking(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getMyBookings(HttpServletRequest httpRequest) {
        Long customerId = getUserIdFromRequest(httpRequest);
        List<BookingResponse> bookings = bookingService.getBookingsByCustomer(customerId);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/venue/{venueId}")
    @PreAuthorize("hasRole('VENUE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getBookingsByVenue(@PathVariable Long venueId) {
        List<BookingResponse> bookings = bookingService.getBookingsByVenue(venueId);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        BookingResponse response = bookingService.getBookingById(id);
        return ResponseEntity.ok(response);
    }
}
