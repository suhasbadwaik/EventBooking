package com.eventmanagement.dto;

import com.eventmanagement.entity.AvailabilityStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponse {
    private Long id;
    private Long venueId;
    private String venueName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AvailabilityStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
