package com.eventmanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
    
    @NotNull(message = "Availability ID is required")
    private Long availabilityId;
}
