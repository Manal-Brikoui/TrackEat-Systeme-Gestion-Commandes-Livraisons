package com.delivery.deliveryapp.driver.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DriverResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String vehicle;
    private String licenseNumber;
    private Double rating;
    private boolean available;
    private Double currentLatitude;
    private Double currentLongitude;
    private String status;
}