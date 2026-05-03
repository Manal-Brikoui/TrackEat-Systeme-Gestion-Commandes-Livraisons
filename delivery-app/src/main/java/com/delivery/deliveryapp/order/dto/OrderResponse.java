package com.delivery.deliveryapp.order.dto;

import com.delivery.deliveryapp.order.entity.OrderStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String clientName;
    private String restaurantName;
    private String driverName;
    private OrderStatus status;
    private Double totalPrice;
    private String deliveryAddress;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private Double driverLatitude;
    private Double driverLongitude;
}