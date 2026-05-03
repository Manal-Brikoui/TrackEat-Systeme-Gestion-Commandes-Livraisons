package com.delivery.deliveryapp.payment.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private String paymentMethodId;
}