package com.delivery.deliveryapp.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private Long restaurantId;
    private String deliveryAddress;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private String paymentMethod;
    private List<OrderItemRequest> items;
}