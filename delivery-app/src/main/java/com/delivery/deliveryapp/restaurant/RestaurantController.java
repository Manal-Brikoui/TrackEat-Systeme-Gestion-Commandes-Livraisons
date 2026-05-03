package com.delivery.deliveryapp.restaurant;

import com.delivery.deliveryapp.restaurant.dto.*;
import com.delivery.deliveryapp.restaurant.entity.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;


    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category request) {
        return ResponseEntity.ok(restaurantService.createCategory(request));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(restaurantService.getAllCategories());
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category request) {
        return ResponseEntity.ok(restaurantService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        restaurantService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/apply")
    public ResponseEntity<RestaurantResponse> apply(@RequestBody RestaurantRequest request) {
        return ResponseEntity.ok(restaurantService.applyAsRestaurant(request));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<RestaurantResponse>> getPending() {
        return ResponseEntity.ok(restaurantService.getPendingRequests());
    }

    @GetMapping("/my")
    public ResponseEntity<RestaurantResponse> getMyRestaurant() {
        return ResponseEntity.ok(restaurantService.getMyRestaurant());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RestaurantResponse> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(restaurantService.updateRequestStatus(id, status));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getAll() {
        return ResponseEntity.ok(restaurantService.getAllApproved());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<RestaurantResponse>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(restaurantService.getByCategory(categoryId));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<RestaurantResponse> toggleOpen(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.toggleOpen(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        restaurantService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/location")
    public ResponseEntity<RestaurantResponse> updateLocation(
            @PathVariable Long id,
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        return ResponseEntity.ok(restaurantService.updateLocation(id, latitude, longitude));
    }

    @PutMapping("/my/info")
    public ResponseEntity<RestaurantResponse> updateMyInfo(@RequestBody UpdateRestaurantRequest request) {
        return ResponseEntity.ok(restaurantService.updateInfo(request));
    }



    @GetMapping("/{restaurantId}/products")
    public ResponseEntity<List<ProductResponse>> getProducts(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(restaurantService.getProductsByRestaurant(restaurantId));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> addProduct(@RequestBody ProductRequest request) {
        return ResponseEntity.ok(restaurantService.addProduct(request));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        restaurantService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(restaurantService.updateProduct(id, request));
    }
}