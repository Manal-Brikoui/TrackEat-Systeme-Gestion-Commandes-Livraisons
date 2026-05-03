package com.delivery.deliveryapp.payment;

import com.delivery.deliveryapp.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    void deleteByOrderId(Long orderId);
}