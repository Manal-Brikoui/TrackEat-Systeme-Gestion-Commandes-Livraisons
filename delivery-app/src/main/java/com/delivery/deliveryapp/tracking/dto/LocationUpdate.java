package com.delivery.deliveryapp.tracking.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationUpdate {
    private Long orderId;
    private Long driverId;
    private Double latitude;
    private Double longitude;
    private String status;
    private Double destLatitude;
    private Double destLongitude;
}