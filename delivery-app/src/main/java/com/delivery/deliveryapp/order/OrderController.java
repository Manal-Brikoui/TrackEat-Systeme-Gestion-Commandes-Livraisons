package com.delivery.deliveryapp.order;

import com.delivery.deliveryapp.order.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> create(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderResponse>> getByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(orderService.getByRestaurantId(restaurantId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<OrderResponse>> getByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(orderService.getByDriverId(driverId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<OrderResponse>> getAvailableOrders() {
        return ResponseEntity.ok(orderService.getAvailableOrders());
    }

    @PatchMapping("/{id}/assign-driver")
    public ResponseEntity<OrderResponse> assignDriver(
            @PathVariable Long id,
            @RequestParam Long driverId) {
        return ResponseEntity.ok(orderService.assignDriver(id, driverId));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<OrderResponse> driverAccept(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.driverAcceptOrder(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<OrderResponse> driverReject(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.driverRejectOrder(id));
    }

    @PatchMapping("/{id}/deliver")
    public ResponseEntity<OrderResponse> deliver(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.deliverOrder(id));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('RESTAURANT_ADMIN')")
    public ResponseEntity<OrderResponse> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.confirmOrder(id));
    }

    @PutMapping("/{id}/decline")
    @PreAuthorize("hasAuthority('RESTAURANT_ADMIN')")
    public ResponseEntity<OrderResponse> decline(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.rejectOrder(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}