package com.eventmanagement.serviceimplementaion;

import com.eventmanagement.dto.AvailabilityRequest;
import com.eventmanagement.dto.AvailabilityResponse;
import com.eventmanagement.entity.Availability;
import com.eventmanagement.entity.AvailabilityStatus;
import com.eventmanagement.entity.User;
import com.eventmanagement.entity.UserRole;
import com.eventmanagement.entity.Venue;
import com.eventmanagement.repository.AvailabilityRepository;
import com.eventmanagement.repository.VenueRepository;
import com.eventmanagement.service.AvailabilityService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AvailabilityServiceImpl implements AvailabilityService{
    
    @Autowired
    private AvailabilityRepository availabilityRepository;
    
    @Autowired
    private VenueRepository venueRepository;
    
    @Autowired
    private UserServiceImpl userService;
    
    @Transactional
    public AvailabilityResponse createAvailability(AvailabilityRequest request, Long ownerId) {
        Venue venue = venueRepository.findById(request.getVenueId())
            .orElseThrow(() -> new RuntimeException("Venue not found with id: " + request.getVenueId()));
        
        // Check ownership or admin
        User currentUser = userService.findById(ownerId);
        if (!venue.getOwner().getId().equals(ownerId) && currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to add availability for this venue");
        }
        
        // Validate time
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }
        
        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Start time must be in the future");
        }
        
        // Check for overlapping availabilities
        List<Availability> overlapping = availabilityRepository.findByVenueAndTimeRange(
            venue, request.getStartTime(), request.getEndTime());
        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Availability slot overlaps with existing slot");
        }
        
        Availability availability = new Availability();
        availability.setVenue(venue);
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setStatus(AvailabilityStatus.AVAILABLE);
        
        availability = availabilityRepository.save(availability);
        return mapToAvailabilityResponse(availability);
    }
    
    @Transactional
    public void deleteAvailability(Long id, Long ownerId) {
        Availability availability = availabilityRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Availability not found with id: " + id));
        
        // Check ownership or admin
        User currentUser = userService.findById(ownerId);
        if (!availability.getVenue().getOwner().getId().equals(ownerId) && currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to delete this availability");
        }
        
        // Don't allow deletion of booked slots
        if (availability.getStatus() == AvailabilityStatus.BOOKED) {
            throw new RuntimeException("Cannot delete a booked availability slot");
        }
        
        availabilityRepository.deleteById(id);
    }
    
    public List<AvailabilityResponse> getAvailabilitiesByVenue(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
            .orElseThrow(() -> new RuntimeException("Venue not found with id: " + venueId));
        
        LocalDateTime now = LocalDateTime.now();
        return availabilityRepository.findAvailableSlotsByVenue(venue, now).stream()
            .map(this::mapToAvailabilityResponse)
            .collect(Collectors.toList());
    }
    
    public List<AvailabilityResponse> getAllAvailabilitiesByVenue(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
            .orElseThrow(() -> new RuntimeException("Venue not found with id: " + venueId));
        
        return availabilityRepository.findByVenue(venue).stream()
            .map(this::mapToAvailabilityResponse)
            .collect(Collectors.toList());
    }
    
    public AvailabilityResponse getAvailabilityById(Long id) {
        Availability availability = availabilityRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Availability not found with id: " + id));
        return mapToAvailabilityResponse(availability);
    }
    
    private AvailabilityResponse mapToAvailabilityResponse(Availability availability) {
        AvailabilityResponse response = new AvailabilityResponse();
        response.setId(availability.getId());
        response.setVenueId(availability.getVenue().getId());
        response.setVenueName(availability.getVenue().getName());
        response.setStartTime(availability.getStartTime());
        response.setEndTime(availability.getEndTime());
        response.setStatus(availability.getStatus());
        response.setCreatedAt(availability.getCreatedAt());
        response.setUpdatedAt(availability.getUpdatedAt());
        return response;
    }
}
