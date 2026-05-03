package com.delivery.deliveryapp.tracking;

import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.driver.DriverRepository;
import com.delivery.deliveryapp.driver.entity.DriverProfile;
import com.delivery.deliveryapp.order.OrderRepository;
import com.delivery.deliveryapp.order.entity.Order;
import com.delivery.deliveryapp.order.entity.OrderStatus;
import com.delivery.deliveryapp.restaurant.entity.Restaurant;
import com.delivery.deliveryapp.shared.enums.RequestStatus;
import com.delivery.deliveryapp.shared.enums.Role;
import com.delivery.deliveryapp.tracking.dto.LocationUpdate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TrackingServiceTest {

    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private DriverRepository driverRepository;
    @Mock private OrderRepository orderRepository;

    @InjectMocks
    private TrackingService trackingService;

    private User driverUser;
    private DriverProfile driverProfile;
    private Order order;

    @BeforeEach
    void setUp() {
        driverUser = User.builder()
                .id(1L)
                .fullName("Karim Driver")
                .email("karim@test.com")
                .role(Role.DRIVER)
                .build();

        driverProfile = DriverProfile.builder()
                .id(1L)
                .user(driverUser)
                .vehicle("Moto Yamaha")
                .licenseNumber("AB-123-CD")
                .rating(0.0)
                .available(true)
                .currentLatitude(33.5731)
                .currentLongitude(-7.5898)
                .requestStatus(RequestStatus.APPROVED)
                .build();

        Restaurant restaurant = Restaurant.builder()
                .id(1L)
                .name("Pizza House")
                .build();

        order = Order.builder()
                .id(1L)
                .driver(driverUser)
                .restaurant(restaurant)
                .status(OrderStatus.PICKED_UP)
                .deliveryLatitude(34.6564)
                .deliveryLongitude(-1.8888)
                .build();
    }

    @Test
    void updateLocation_success() {
        LocationUpdate locationUpdate = LocationUpdate.builder()
                .orderId(1L)
                .driverId(1L)
                .latitude(33.5731)
                .longitude(-7.5898)
                .status("PICKED_UP")
                .build();

        when(driverRepository.findByUserId(1L)).thenReturn(Optional.of(driverProfile));
        when(driverRepository.save(any())).thenReturn(driverProfile);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        doNothing().when(messagingTemplate).convertAndSend(any(String.class), any(Object.class));

        trackingService.updateLocation(locationUpdate);

        assertEquals(33.5731, driverProfile.getCurrentLatitude());
        assertEquals(-7.5898, driverProfile.getCurrentLongitude());
        assertEquals(34.6564, locationUpdate.getDestLatitude());
        assertEquals(-1.8888, locationUpdate.getDestLongitude());
        verify(messagingTemplate, times(1)).convertAndSend(any(String.class), any(Object.class));
    }

    @Test
    void updateLocation_driverNotFound() {
        LocationUpdate locationUpdate = LocationUpdate.builder()
                .orderId(1L)
                .driverId(99L)
                .latitude(33.5731)
                .longitude(-7.5898)
                .status("PICKED_UP")
                .build();

        when(driverRepository.findByUserId(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> trackingService.updateLocation(locationUpdate));

        assertEquals("Driver non trouvé", ex.getMessage());
    }

    @Test
    void getLastLocation_success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(driverRepository.findByUserId(1L)).thenReturn(Optional.of(driverProfile));

        LocationUpdate response = trackingService.getLastLocation(1L);

        assertNotNull(response);
        assertEquals(1L,       response.getOrderId());
        assertEquals(33.5731,  response.getLatitude());
        assertEquals(-7.5898,  response.getLongitude());
        assertEquals(34.6564,  response.getDestLatitude());
        assertEquals(-1.8888,  response.getDestLongitude());
        assertEquals("PICKED_UP", response.getStatus());
    }

    @Test
    void getLastLocation_noDriver() {
        Order orderNoDriver = Order.builder()
                .id(1L)
                .driver(null)
                .status(OrderStatus.PENDING)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(orderNoDriver));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> trackingService.getLastLocation(1L));

        assertEquals("Pas de driver assigné à cette commande", ex.getMessage());
    }
}