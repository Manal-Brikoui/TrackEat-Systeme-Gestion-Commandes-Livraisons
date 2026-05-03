package com.delivery.deliveryapp.review.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String clientName;
    private Long restaurantId;
    private String restaurantName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}