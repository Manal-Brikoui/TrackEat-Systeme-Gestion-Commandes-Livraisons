package com.delivery.deliveryapp.order;

import com.delivery.deliveryapp.order.entity.Order;
import com.delivery.deliveryapp.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByClientId(Long clientId);
    List<Order> findByDriverId(Long driverId);
    List<Order> findByRestaurantId(Long restaurantId);
    List<Order> findByStatus(OrderStatus status);
}