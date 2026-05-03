package com.delivery.deliveryapp.restaurant.dto;

import lombok.Data;
import java.util.List;

@Data
public class WorkingHoursRequest {
    private Long restaurantId;
    private List<WorkingHourItem> hours;

    @Data
    public static class WorkingHourItem {
        private Integer dayOfWeek;
        private String openTime;
        private String closeTime;
        private boolean closed;
    }
}