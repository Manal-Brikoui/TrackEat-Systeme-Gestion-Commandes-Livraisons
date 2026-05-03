package com.delivery.deliveryapp.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WorkingHoursResponse {
    private Long id;
    private Integer dayOfWeek;
    private String openTime;
    private String closeTime;
    private boolean closed;
}