package com.delivery.deliveryapp.restaurant.dto;

import lombok.Data;

@Data
public class RestaurantRequest {
    private String name;
    private String address;
    private String phone;
    private String imageUrl;
    private Long categoryId;
    private String description;
    private Double latitude;
    private Double longitude;
}