package com.eventmanagement.controller;

import com.eventmanagement.dto.AvailabilityRequest;
import com.eventmanagement.dto.AvailabilityResponse;
import com.eventmanagement.serviceimplementaion.AvailabilityServiceImpl;
import com.eventmanagement.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availabilities")
@CrossOrigin(origins = "*")
public class AvailabilityController {
    
    @Autowired
    private AvailabilityServiceImpl availabilityService;
    
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
    @PreAuthorize("hasRole('VENUE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<AvailabilityResponse> createAvailability(@Valid @RequestBody AvailabilityRequest request,
                                                                   HttpServletRequest httpRequest) {
        Long ownerId = getUserIdFromRequest(httpRequest);
        AvailabilityResponse response = availabilityService.createAvailability(request, ownerId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('VENUE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Long id,
                                                     HttpServletRequest httpRequest) {
        Long ownerId = getUserIdFromRequest(httpRequest);
        availabilityService.deleteAvailability(id, ownerId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/venue/{venueId}")
    @PreAuthorize("hasRole('VENUE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<AvailabilityResponse>> getAllAvailabilitiesByVenue(@PathVariable Long venueId) {
        List<AvailabilityResponse> availabilities = availabilityService.getAllAvailabilitiesByVenue(venueId);
        return ResponseEntity.ok(availabilities);
    }
    
    @GetMapping("/public/venue/{venueId}")
    public ResponseEntity<List<AvailabilityResponse>> getAvailableSlotsByVenue(@PathVariable Long venueId) {
        List<AvailabilityResponse> availabilities = availabilityService.getAvailabilitiesByVenue(venueId);
        return ResponseEntity.ok(availabilities);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AvailabilityResponse> getAvailabilityById(@PathVariable Long id) {
        AvailabilityResponse response = availabilityService.getAvailabilityById(id);
        return ResponseEntity.ok(response);
    }
}
