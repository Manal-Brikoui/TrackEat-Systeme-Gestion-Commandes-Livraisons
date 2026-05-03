package com.delivery.deliveryapp.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Double amount;
    private String status;
    private String stripePaymentId;
    private String currency;
}