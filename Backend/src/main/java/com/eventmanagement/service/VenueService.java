package com.eventmanagement.service;

import com.eventmanagement.dto.VenueRequest;
import com.eventmanagement.dto.VenueResponse;

import java.util.List;

public interface VenueService {

    VenueResponse createVenue(VenueRequest request, Long ownerId);

    VenueResponse updateVenue(Long id, VenueRequest request, Long ownerId);

    void deleteVenue(Long id, Long ownerId);

    VenueResponse getVenueById(Long id);

    List<VenueResponse> getAllVenues();

    List<VenueResponse> getVenuesByOwner(Long ownerId);

    List<VenueResponse> searchVenues(String city, String searchTerm);
}
