package com.delivery.deliveryapp.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private boolean available;
    private String restaurantName;
    private Long categoryId;
    private String categoryName;
}