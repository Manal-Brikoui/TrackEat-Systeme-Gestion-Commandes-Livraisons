package com.delivery.deliveryapp.restaurant;

import com.delivery.deliveryapp.restaurant.entity.Restaurant;
import com.delivery.deliveryapp.shared.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByOpenTrue();
    List<Restaurant> findByCategoryId(Long categoryId);
    List<Restaurant> findByOwnerId(Long ownerId);
    List<Restaurant> findByRequestStatus(RequestStatus requestStatus);
}