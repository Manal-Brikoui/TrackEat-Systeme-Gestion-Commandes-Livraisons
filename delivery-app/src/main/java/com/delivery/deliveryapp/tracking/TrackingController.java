package com.delivery.deliveryapp.tracking;

import com.delivery.deliveryapp.tracking.dto.LocationUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    @MessageMapping("/location")
    public void updateLocation(LocationUpdate locationUpdate) {
        trackingService.updateLocation(locationUpdate);
    }

    @GetMapping("/api/tracking/{orderId}")
    public ResponseEntity<LocationUpdate> getLastLocation(@PathVariable Long orderId) {
        return ResponseEntity.ok(trackingService.getLastLocation(orderId));
    }

    @PostMapping("/api/tracking/update")
    public ResponseEntity<Void> updateLocationRest(@RequestBody LocationUpdate locationUpdate) {
        trackingService.updateLocation(locationUpdate);
        return ResponseEntity.ok().build();
    }
}