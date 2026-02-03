package com.eventmanagement.controller;

import com.eventmanagement.dto.VenueRequest;
import com.eventmanagement.dto.VenueResponse;
import com.eventmanagement.serviceimplementaion.VenueServiceImpl;
import com.eventmanagement.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@CrossOrigin(origins = "*")
public class VenueController {
    
    @Autowired
    private VenueServiceImpl venueService;
    
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
    public ResponseEntity<VenueResponse> createVenue(@Valid @RequestBody VenueRequest request,
                                                      HttpServletRequest httpRequest) {
        Long ownerId = getUserIdFromRequest(httpRequest);
        VenueResponse response = venueService.createVenue(request, ownerId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENUE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<VenueResponse> updateVenue(@PathVariable Long id,
                                                     @Valid @RequestBody VenueRequest request,
                                                     HttpServletRequest httpRequest) {
        Long ownerId = getUserIdFromRequest(httpRequest);
        VenueResponse response = venueService.updateVenue(id, request, ownerId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('VENUE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id,
                                             HttpServletRequest httpRequest) {
        Long ownerId = getUserIdFromRequest(httpRequest);
        venueService.deleteVenue(id, ownerId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> getVenueById(@PathVariable Long id) {
        VenueResponse response = venueService.getVenueById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/public/all")
    public ResponseEntity<List<VenueResponse>> getAllVenues(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String searchTerm) {
        List<VenueResponse> venues;
        if (city != null || searchTerm != null) {
            venues = venueService.searchVenues(city, searchTerm);
        } else {
            venues = venueService.getAllVenues();
        }
        return ResponseEntity.ok(venues);
    }
    
    @GetMapping("/my-venues")
    @PreAuthorize("hasRole('VENUE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<VenueResponse>> getMyVenues(HttpServletRequest httpRequest) {
        Long ownerId = getUserIdFromRequest(httpRequest);
        List<VenueResponse> venues = venueService.getVenuesByOwner(ownerId);
        return ResponseEntity.ok(venues);
    }
}
