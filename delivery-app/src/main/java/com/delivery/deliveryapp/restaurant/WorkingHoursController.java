package com.delivery.deliveryapp.restaurant;

import com.delivery.deliveryapp.restaurant.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/working-hours")
@RequiredArgsConstructor
public class WorkingHoursController {

    private final WorkingHoursService workingHoursService;

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<WorkingHoursResponse>> getByRestaurant(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(workingHoursService.getByRestaurant(restaurantId));
    }

    @PutMapping
    public ResponseEntity<List<WorkingHoursResponse>> updateHours(
            @RequestBody WorkingHoursRequest request) {
        return ResponseEntity.ok(workingHoursService.updateHours(request));
    }
}