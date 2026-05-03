package com.delivery.deliveryapp.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RestaurantResponse {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private String imageUrl;
    private boolean open;
    private String categoryName;
    private String ownerName;
    private String requestStatus;
    private Double latitude;
    private Double longitude;
    private boolean currentlyOpen;
}