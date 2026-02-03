package com.eventmanagement.service;

import com.eventmanagement.dto.BookingRequest;
import com.eventmanagement.dto.BookingResponse;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request, Long customerId);

    BookingResponse confirmPayment(String razorpayOrderId,
                                   String razorpayPaymentId,
                                   String razorpaySignature);

    void cancelBooking(Long bookingId, Long userId);

    List<BookingResponse> getBookingsByCustomer(Long customerId);

    List<BookingResponse> getBookingsByVenue(Long venueId);

    BookingResponse getBookingById(Long id);
}
