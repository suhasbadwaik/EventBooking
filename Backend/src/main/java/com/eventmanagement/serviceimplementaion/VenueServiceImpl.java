package com.eventmanagement.serviceimplementaion;

import com.eventmanagement.dto.VenueRequest;
import com.eventmanagement.dto.VenueResponse;
import com.eventmanagement.entity.User;
import com.eventmanagement.entity.UserRole;
import com.eventmanagement.entity.Venue;
import com.eventmanagement.repository.VenueRepository;
import com.eventmanagement.service.VenueService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VenueServiceImpl implements VenueService{
    
    @Autowired
    private VenueRepository venueRepository;
    
    @Autowired
    private UserServiceImpl userService;
    
    @Transactional
    public VenueResponse createVenue(VenueRequest request, Long ownerId) {
        User owner = userService.findById(ownerId);
        
        Venue venue = new Venue();
        venue.setName(request.getName());
        venue.setDescription(request.getDescription());
        venue.setAddress(request.getAddress());
        venue.setCity(request.getCity());
        venue.setState(request.getState());
        venue.setZipCode(request.getZipCode());
        venue.setPricePerHour(request.getPricePerHour());
        venue.setCapacity(request.getCapacity());
        venue.setOwner(owner);
        venue.setActive(true);
        
        venue = venueRepository.save(venue);
        return mapToVenueResponse(venue);
    }
    
    @Transactional
    public VenueResponse updateVenue(Long id, VenueRequest request, Long ownerId) {
        Venue venue = venueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Venue not found with id: " + id));
        
        // Check ownership or admin
        User currentUser = userService.findById(ownerId);
        if (!venue.getOwner().getId().equals(ownerId) && currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to update this venue");
        }
        
        venue.setName(request.getName());
        venue.setDescription(request.getDescription());
        venue.setAddress(request.getAddress());
        venue.setCity(request.getCity());
        venue.setState(request.getState());
        venue.setZipCode(request.getZipCode());
        venue.setPricePerHour(request.getPricePerHour());
        venue.setCapacity(request.getCapacity());
        
        venue = venueRepository.save(venue);
        return mapToVenueResponse(venue);
    }
    
    @Transactional
    public void deleteVenue(Long id, Long ownerId) {
        Venue venue = venueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Venue not found with id: " + id));
        
        // Check ownership or admin
        User currentUser = userService.findById(ownerId);
        if (!venue.getOwner().getId().equals(ownerId) && currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to delete this venue");
        }
        
        venueRepository.deleteById(id);
    }
    
    public VenueResponse getVenueById(Long id) {
        Venue venue = venueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Venue not found with id: " + id));
        return mapToVenueResponse(venue);
    }
    
    public List<VenueResponse> getAllVenues() {
        return venueRepository.findByActive(true).stream()
            .map(this::mapToVenueResponse)
            .collect(Collectors.toList());
    }
    
    public List<VenueResponse> getVenuesByOwner(Long ownerId) {
        User owner = userService.findById(ownerId);
        return venueRepository.findByOwnerAndActive(owner, true).stream()
            .map(this::mapToVenueResponse)
            .collect(Collectors.toList());
    }
    
    public List<VenueResponse> searchVenues(String city, String searchTerm) {
        return venueRepository.searchVenues(city, searchTerm).stream()
            .map(this::mapToVenueResponse)
            .collect(Collectors.toList());
    }
    
    private VenueResponse mapToVenueResponse(Venue venue) {
        VenueResponse response = new VenueResponse();
        response.setId(venue.getId());
        response.setName(venue.getName());
        response.setDescription(venue.getDescription());
        response.setAddress(venue.getAddress());
        response.setCity(venue.getCity());
        response.setState(venue.getState());
        response.setZipCode(venue.getZipCode());
        response.setPricePerHour(venue.getPricePerHour());
        response.setCapacity(venue.getCapacity());
        response.setOwnerId(venue.getOwner().getId());
        response.setOwnerName(venue.getOwner().getFirstName() + " " + venue.getOwner().getLastName());
        response.setActive(venue.isActive());
        response.setCreatedAt(venue.getCreatedAt());
        response.setUpdatedAt(venue.getUpdatedAt());
        return response;
    }
}
