package com.eventmanagement.dto;

import com.eventmanagement.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long venueId;
    private String venueName;
    private Long availabilityId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double totalAmount;
    private BookingStatus status;
    private String razorpayOrderId;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
