package com.delivery.deliveryapp.payment;

import com.delivery.deliveryapp.order.OrderRepository;
import com.delivery.deliveryapp.order.entity.Order;
import com.delivery.deliveryapp.order.entity.OrderStatus;
import com.delivery.deliveryapp.payment.dto.*;
import com.delivery.deliveryapp.payment.entity.Payment;
import com.delivery.deliveryapp.restaurant.entity.Restaurant;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.shared.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private OrderRepository orderRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Order cashOrder;
    private Order onlineOrder;
    private Payment payment;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "currency", "mad");

        User client = User.builder()
                .id(1L)
                .fullName("Ahmed Test")
                .email("ahmed@test.com")
                .role(Role.CLIENT)
                .build();

        Restaurant restaurant = Restaurant.builder()
                .id(1L)
                .name("Pizza House")
                .build();

        cashOrder = Order.builder()
                .id(1L)
                .client(client)
                .restaurant(restaurant)
                .status(OrderStatus.PENDING)
                .totalPrice(90.0)
                .paymentMethod("CASH")
                .build();

        onlineOrder = Order.builder()
                .id(2L)
                .client(client)
                .restaurant(restaurant)
                .status(OrderStatus.PENDING)
                .totalPrice(90.0)
                .paymentMethod("ONLINE")
                .build();

        payment = Payment.builder()
                .id(1L)
                .order(cashOrder)
                .amount(90.0)
                .status("PENDING_CASH")
                .currency("mad")
                .build();
    }

    @Test
    void processPayment_cash_success() {
        PaymentRequest request = new PaymentRequest();
        request.setOrderId(1L);
        request.setPaymentMethodId(null);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(cashOrder));
        when(paymentRepository.save(any())).thenReturn(payment);

        PaymentResponse response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals("PENDING_CASH", response.getStatus());
        assertEquals(90.0, response.getAmount());
        verify(paymentRepository, times(1)).save(any());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void processPayment_orderNotFound() {
        PaymentRequest request = new PaymentRequest();
        request.setOrderId(99L);

        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> paymentService.processPayment(request));

        assertEquals("Commande non trouvée", ex.getMessage());
    }

    @Test
    void getByOrderId_success() {
        when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.of(payment));

        PaymentResponse response = paymentService.getByOrderId(1L);

        assertNotNull(response);
        assertEquals(1L, response.getOrderId());
        assertEquals("PENDING_CASH", response.getStatus());
    }

    @Test
    void getByOrderId_notFound() {
        when(paymentRepository.findByOrderId(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> paymentService.getByOrderId(99L));

        assertEquals("Paiement non trouvé", ex.getMessage());
    }
}