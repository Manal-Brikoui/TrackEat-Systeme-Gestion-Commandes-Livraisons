package com.delivery.deliveryapp.review;

import com.delivery.deliveryapp.review.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(@RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.addReview(request));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<ReviewResponse>> getByRestaurant(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(reviewService.getByRestaurant(restaurantId));
    }

    @GetMapping("/restaurant/{restaurantId}/rating")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(reviewService.getAverageRating(restaurantId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}