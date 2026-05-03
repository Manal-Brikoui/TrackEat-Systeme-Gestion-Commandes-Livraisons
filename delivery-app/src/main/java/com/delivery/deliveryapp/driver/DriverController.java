package com.delivery.deliveryapp.driver;

import com.delivery.deliveryapp.driver.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;


    @PostMapping("/apply")
    public ResponseEntity<DriverResponse> apply(@RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.applyAsDriver(request));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<DriverResponse>> getPending() {
        return ResponseEntity.ok(driverService.getPendingRequests());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DriverResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(driverService.updateRequestStatus(id, status));
    }

    @GetMapping("/me")
    public ResponseEntity<DriverResponse> getMyProfile() {
        return ResponseEntity.ok(driverService.getMyProfile());
    }

    @GetMapping("/available")
    public ResponseEntity<List<DriverResponse>> getAvailable() {
        return ResponseEntity.ok(driverService.getAvailableDrivers());
    }

    @PatchMapping("/toggle")
    public ResponseEntity<DriverResponse> toggleAvailability() {
        return ResponseEntity.ok(driverService.toggleAvailability());
    }

    @PatchMapping("/location")
    public ResponseEntity<DriverResponse> updateLocation(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        return ResponseEntity.ok(driverService.updateLocation(latitude, longitude));
    }
    @GetMapping("/all")
    public ResponseEntity<List<DriverResponse>> getAll() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }
}