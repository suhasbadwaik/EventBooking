package com.eventmanagement.service;

import com.eventmanagement.dto.AvailabilityRequest;
import com.eventmanagement.dto.AvailabilityResponse;

import java.util.List;

public interface AvailabilityService {

    AvailabilityResponse createAvailability(AvailabilityRequest request, Long ownerId);

    void deleteAvailability(Long id, Long ownerId);

    List<AvailabilityResponse> getAvailabilitiesByVenue(Long venueId);

    List<AvailabilityResponse> getAllAvailabilitiesByVenue(Long venueId);

    AvailabilityResponse getAvailabilityById(Long id);
}
