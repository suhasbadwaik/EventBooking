package com.eventmanagement.service;

import com.razorpay.RazorpayException;

public interface RazorpayService {

    String createOrder(Double amount, Long bookingId) throws RazorpayException;

    boolean verifyPayment(String orderId, String paymentId, String signature);
}
