package com.delivery.deliveryapp.tracking;

import com.delivery.deliveryapp.driver.DriverRepository;
import com.delivery.deliveryapp.driver.entity.DriverProfile;
import com.delivery.deliveryapp.order.OrderRepository;
import com.delivery.deliveryapp.order.entity.Order;
import com.delivery.deliveryapp.tracking.dto.LocationUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final SimpMessagingTemplate messagingTemplate;
    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;

    public void updateLocation(LocationUpdate locationUpdate) {

        DriverProfile driver = driverRepository
                .findByUserId(locationUpdate.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver non trouvé"));

        driver.setCurrentLatitude(locationUpdate.getLatitude());
        driver.setCurrentLongitude(locationUpdate.getLongitude());
        driverRepository.save(driver);

        Order order = orderRepository.findById(locationUpdate.getOrderId())
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        Double destLat = order.getDeliveryLatitude();
        Double destLng = order.getDeliveryLongitude();

        if (destLat == null || destLng == null) {
            destLat = locationUpdate.getLatitude();
            destLng = locationUpdate.getLongitude();
        }

        locationUpdate.setDestLatitude(destLat);
        locationUpdate.setDestLongitude(destLng);
        locationUpdate.setStatus(order.getStatus().name());

        messagingTemplate.convertAndSend(
                "/topic/order/" + locationUpdate.getOrderId(),
                locationUpdate
        );
    }

    public LocationUpdate getLastLocation(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        if (order.getDriver() == null) {
            throw new RuntimeException("Pas de driver assigné à cette commande");
        }

        DriverProfile driver = driverRepository
                .findByUserId(order.getDriver().getId())
                .orElseThrow(() -> new RuntimeException("Profil driver non trouvé"));

        Double destLat = order.getDeliveryLatitude();
        Double destLng = order.getDeliveryLongitude();

        if (destLat == null || destLng == null) {
            destLat = driver.getCurrentLatitude();
            destLng = driver.getCurrentLongitude();
        }

        return LocationUpdate.builder()
                .orderId(orderId)
                .driverId(order.getDriver().getId())
                .latitude(driver.getCurrentLatitude())
                .longitude(driver.getCurrentLongitude())
                .status(order.getStatus().name())
                .destLatitude(destLat)
                .destLongitude(destLng)
                .build();
    }
}