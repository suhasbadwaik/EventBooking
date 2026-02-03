package com.eventmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VenueResponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private Double pricePerHour;
    private Integer capacity;
    private Long ownerId;
    private String ownerName;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
