package com.delivery.deliveryapp.restaurant;

import com.delivery.deliveryapp.restaurant.entity.WorkingHours;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkingHoursRepository extends JpaRepository<WorkingHours, Long> {
    List<WorkingHours> findByRestaurantId(Long restaurantId);
    void deleteByRestaurantId(Long restaurantId);
}