package com.delivery.deliveryapp.restaurant.dto;

import lombok.Data;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private Long restaurantId;
    private Long categoryId;
}