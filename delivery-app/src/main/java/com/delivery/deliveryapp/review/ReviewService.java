package com.delivery.deliveryapp.review;

import com.delivery.deliveryapp.auth.UserRepository;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.restaurant.RestaurantRepository;
import com.delivery.deliveryapp.restaurant.entity.Restaurant;
import com.delivery.deliveryapp.review.dto.*;
import com.delivery.deliveryapp.review.entity.Review;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    public ReviewResponse addReview(ReviewRequest request) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));

        if (reviewRepository.existsByClientIdAndRestaurantId(
                client.getId(), request.getRestaurantId())) {
            throw new RuntimeException("Vous avez déjà laissé un avis");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("La note doit être entre 1 et 5");
        }

        Review review = Review.builder()
                .client(client)
                .restaurant(restaurant)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return toReviewResponse(reviewRepository.save(review));
    }

    public List<ReviewResponse> getByRestaurant(Long restaurantId) {
        return reviewRepository.findByRestaurantId(restaurantId)
                .stream().map(this::toReviewResponse)
                .collect(Collectors.toList());
    }

    public Double getAverageRating(Long restaurantId) {
        Double avg = reviewRepository.findAverageRatingByRestaurantId(restaurantId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    private ReviewResponse toReviewResponse(Review r) {
        return new ReviewResponse(
                r.getId(),
                r.getClient().getFullName(),
                r.getRestaurant().getId(),
                r.getRestaurant().getName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}