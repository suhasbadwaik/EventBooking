package com.eventmanagement.serviceimplementaion;

import com.eventmanagement.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class RazorpayServiceImpl implements RazorpayService{
    
    @Value("${razorpay.key.id}")
    private String razorpayKeyId;
    
    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;
    
    private RazorpayClient getRazorpayClient() throws RazorpayException {
        return new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }
    
    public String createOrder(Double amount, Long bookingId) throws RazorpayException {
        RazorpayClient razorpay = getRazorpayClient();
        
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount * 100); // Amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "booking_" + bookingId);
        orderRequest.put("notes", new JSONObject().put("bookingId", bookingId.toString()));
        
        Order order = razorpay.orders.create(orderRequest);
        return order.get("id");
    }
    
    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            String generatedSignature = calculateHMAC(payload, razorpayKeySecret);
            return generatedSignature.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
    
    private String calculateHMAC(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error calculating HMAC", e);
        }
    }
}
