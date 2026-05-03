package com.delivery.deliveryapp.order;

import com.delivery.deliveryapp.auth.UserRepository;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.notification.NotificationService;
import com.delivery.deliveryapp.order.dto.*;
import com.delivery.deliveryapp.order.entity.*;
import com.delivery.deliveryapp.restaurant.ProductRepository;
import com.delivery.deliveryapp.restaurant.RestaurantRepository;
import com.delivery.deliveryapp.restaurant.entity.Product;
import com.delivery.deliveryapp.restaurant.entity.Restaurant;
import com.delivery.deliveryapp.shared.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private RestaurantRepository restaurantRepository;
    @Mock private ProductRepository productRepository;
    @Mock private NotificationService notificationService;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks
    private OrderService orderService;

    private User client;
    private Restaurant restaurant;
    private Product product;
    private CreateOrderRequest createOrderRequest;

    @BeforeEach
    void setUp() {
        client = User.builder()
                .id(1L)
                .fullName("Ahmed Test")
                .email("ahmed@test.com")
                .role(Role.CLIENT)
                .build();

        restaurant = Restaurant.builder()
                .id(1L)
                .name("Pizza House")
                .open(true)
                .build();

        product = Product.builder()
                .id(1L)
                .name("Pizza Margherita")
                .price(45.0)
                .build();

        OrderItemRequest itemRequest = new OrderItemRequest();
        itemRequest.setProductId(1L);
        itemRequest.setQuantity(2);

        createOrderRequest = new CreateOrderRequest();
        createOrderRequest.setRestaurantId(1L);
        createOrderRequest.setDeliveryAddress("12 Rue Hassan II");
        createOrderRequest.setPaymentMethod("CASH");
        createOrderRequest.setItems(List.of(itemRequest));

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("ahmed@test.com");


        lenient().doNothing().when(notificationService)
                .sendNotification(any(), any(), any(), any());

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void createOrder_success() {
        Order savedOrder = Order.builder()
                .id(1L)
                .client(client)
                .restaurant(restaurant)
                .status(OrderStatus.PENDING)
                .totalPrice(90.0)
                .deliveryAddress("12 Rue Hassan II")
                .paymentMethod("CASH")
                .items(List.of())
                .build();

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(client));
        when(restaurantRepository.findById(any())).thenReturn(Optional.of(restaurant));
        when(productRepository.findById(any())).thenReturn(Optional.of(product));
        when(orderRepository.save(any())).thenReturn(savedOrder);

        OrderResponse response = orderService.createOrder(createOrderRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("CASH", response.getPaymentMethod());
        assertEquals(OrderStatus.PENDING, response.getStatus());
    }

    @Test
    void createOrder_restaurantNotFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(client));
        when(restaurantRepository.findById(any())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> orderService.createOrder(createOrderRequest));

        assertEquals("Restaurant non trouvé", ex.getMessage());
    }

    @Test
    void updateStatus_success() {
        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.PENDING)
                .client(client)
                .restaurant(restaurant)
                .items(List.of())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        OrderResponse response = orderService.updateStatus(1L, "CONFIRMED");

        assertEquals(OrderStatus.CONFIRMED, response.getStatus());
    }

    @Test
    void cancelOrder_success() {
        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.PENDING)
                .client(client)
                .restaurant(restaurant)
                .items(List.of())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        orderService.cancelOrder(1L);

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    void getMyOrders_success() {
        Order order = Order.builder()
                .id(1L)
                .client(client)
                .restaurant(restaurant)
                .status(OrderStatus.PENDING)
                .totalPrice(90.0)
                .deliveryAddress("12 Rue Hassan II")
                .paymentMethod("CASH")
                .items(List.of())
                .build();

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(client));
        when(orderRepository.findByClientId(1L)).thenReturn(List.of(order));

        List<OrderResponse> responses = orderService.getMyOrders();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(OrderStatus.PENDING, responses.get(0).getStatus());
    }

    @Test
    void getById_success() {
        Order order = Order.builder()
                .id(1L)
                .client(client)
                .restaurant(restaurant)
                .status(OrderStatus.PENDING)
                .totalPrice(90.0)
                .deliveryAddress("12 Rue Hassan II")
                .paymentMethod("CASH")
                .items(List.of())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getById_notFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> orderService.getById(99L));

        assertEquals("Commande non trouvée", ex.getMessage());
    }
}