package com.delivery.deliveryapp.restaurant;

import com.delivery.deliveryapp.restaurant.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByRestaurantId(Long restaurantId);
    List<Product> findByRestaurantIdAndAvailableTrue(Long restaurantId);
}