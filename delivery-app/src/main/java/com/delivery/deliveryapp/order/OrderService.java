package com.delivery.deliveryapp.order;

import com.delivery.deliveryapp.auth.UserRepository;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.driver.DriverRepository;
import com.delivery.deliveryapp.notification.NotificationService;
import com.delivery.deliveryapp.order.dto.*;
import com.delivery.deliveryapp.order.entity.*;
import com.delivery.deliveryapp.payment.PaymentRepository;
import com.delivery.deliveryapp.restaurant.ProductRepository;
import com.delivery.deliveryapp.restaurant.RestaurantRepository;
import com.delivery.deliveryapp.restaurant.entity.Product;
import com.delivery.deliveryapp.restaurant.entity.Restaurant;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final DriverRepository driverRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));

        if (!restaurant.isOpen()) {
            throw new RuntimeException("Ce restaurant est actuellement fermé");
        }

        List<OrderItem> items = request.getItems().stream().map(itemReq -> {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
            return OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();
        }).collect(Collectors.toList());

        double total = items.stream()
                .mapToDouble(i -> i.getUnitPrice() * i.getQuantity())
                .sum();

        Order order = Order.builder()
                .client(client)
                .restaurant(restaurant)
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryLatitude(request.getDeliveryLatitude())
                .deliveryLongitude(request.getDeliveryLongitude())
                .totalPrice(total)
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .build();

        Order saved = orderRepository.save(order);
        items.forEach(item -> item.setOrder(saved));
        saved.setItems(items);
        orderRepository.save(saved);

        if (restaurant.getOwner() != null) {
            notificationService.sendNotification(
                    restaurant.getOwner(),
                    "Nouvelle commande #" + saved.getId() + " de " + client.getFullName(),
                    "NEW_ORDER",
                    saved.getId()
            );
        }

        return toOrderResponse(saved);
    }

    @Transactional
    public List<OrderResponse> getMyOrders() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return orderRepository.findByClientId(client.getId())
                .stream().map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse getById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        return toOrderResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        order.setStatus(OrderStatus.valueOf(status));

        notificationService.sendNotification(
                order.getClient(),
                "Votre commande #" + id + " est maintenant : " + status,
                "ORDER_STATUS_UPDATED",
                id
        );

        return toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        if (order.getRestaurant() != null && order.getRestaurant().getOwner() != null) {
            notificationService.sendNotification(
                    order.getRestaurant().getOwner(),
                    "La commande #" + id + " a été annulée par le client",
                    "ORDER_CANCELLED",
                    id
            );
        }
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        Set<OrderStatus> deletableStatuses = Set.of(
                OrderStatus.DELIVERED,
                OrderStatus.CANCELLED
        );

        if (!deletableStatuses.contains(order.getStatus())) {
            throw new RuntimeException(
                    "Impossible de supprimer une commande en cours (statut: "
                            + order.getStatus() + "). Seules les commandes DELIVERED ou CANCELLED peuvent être supprimées."
            );
        }

        paymentRepository.deleteByOrderId(id);
        orderRepository.deleteById(id);
    }

    @Transactional
    public List<OrderResponse> getByRestaurantId(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId)
                .stream().map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<OrderResponse> getByDriverId(Long driverId) {
        return orderRepository.findByDriverId(driverId)
                .stream().map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<OrderResponse> getAvailableOrders() {
        return orderRepository.findByStatus(OrderStatus.READY)
                .stream().map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse assignDriver(Long orderId, Long driverId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver non trouvé"));

        order.setDriver(driver);

        notificationService.sendNotification(
                order.getClient(),
                "Un livreur a été assigné à votre commande #" + orderId,
                "DRIVER_ASSIGNED",
                orderId
        );

        notificationService.sendNotification(
                driver,
                "Vous avez une nouvelle commande #" + orderId + " à livrer",
                "NEW_DELIVERY",
                orderId
        );

        return toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse driverAcceptOrder(Long orderId) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        order.setDriver(driver);
        order.setStatus(OrderStatus.PICKED_UP);

        notificationService.sendNotification(
                order.getClient(),
                "Votre commande est en route !",
                "ORDER_PICKED_UP",
                orderId
        );

        if (order.getRestaurant() != null && order.getRestaurant().getOwner() != null) {
            notificationService.sendNotification(
                    order.getRestaurant().getOwner(),
                    "Le livreur " + driver.getFullName() + " a accepté la commande #" + orderId,
                    "DRIVER_ACCEPTED",
                    orderId
            );
        }

        return toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse driverRejectOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        order.setDriver(null);
        order.setStatus(OrderStatus.READY);

        if (order.getRestaurant() != null && order.getRestaurant().getOwner() != null) {
            notificationService.sendNotification(
                    order.getRestaurant().getOwner(),
                    "Le livreur a refusé la commande #" + orderId,
                    "DRIVER_REJECTED",
                    orderId
            );
        }

        return toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse deliverOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        order.setStatus(OrderStatus.DELIVERED);

        notificationService.sendNotification(
                order.getClient(),
                "Votre commande #" + orderId + " a été livrée !",
                "ORDER_DELIVERED",
                orderId
        );

        return toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        order.setStatus(OrderStatus.CONFIRMED);

        notificationService.sendNotification(
                order.getClient(),
                "Votre commande #" + orderId + " a été confirmée par le restaurant",
                "ORDER_CONFIRMED",
                orderId
        );

        return toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse rejectOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        order.setStatus(OrderStatus.CANCELLED);

        notificationService.sendNotification(
                order.getClient(),
                "Votre commande #" + orderId + " a été refusée par le restaurant",
                "ORDER_REJECTED",
                orderId
        );

        return toOrderResponse(orderRepository.save(order));
    }

    // ── Mapper ──────────────────────────────────────────────────────────────
    private OrderResponse toOrderResponse(Order o) {
        List<OrderItemResponse> itemResponses = o.getItems() == null ? List.of() :
                o.getItems().stream().map(i -> new OrderItemResponse(
                        i.getProduct().getId(),
                        i.getProduct().getName(),
                        i.getQuantity(),
                        i.getUnitPrice()
                )).collect(Collectors.toList());

        Double driverLat = null;
        Double driverLng = null;
        if (o.getDriver() != null) {
            var dp = driverRepository.findByUserId(o.getDriver().getId());
            if (dp.isPresent()) {
                driverLat = dp.get().getCurrentLatitude();
                driverLng = dp.get().getCurrentLongitude();
            }
        }

        return new OrderResponse(
                o.getId(),                                                          // 1  id
                o.getClient() != null ? o.getClient().getFullName() : null,        // 2  clientName
                o.getRestaurant() != null ? o.getRestaurant().getName() : null,    // 3  restaurantName
                o.getDriver() != null ? o.getDriver().getFullName() : null,        // 4  driverName
                o.getStatus(),                                                      // 5  status
                o.getTotalPrice(),                                                  // 6  totalPrice
                o.getDeliveryAddress(),                                             // 7  deliveryAddress
                o.getDeliveryLatitude(),                                            // 8  deliveryLatitude
                o.getDeliveryLongitude(),                                           // 9  deliveryLongitude
                o.getPaymentMethod(),                                               // 10 paymentMethod
                o.getCreatedAt(),                                                   // 11 createdAt
                itemResponses,                                                      // 12 items
                driverLat,                                                          // 13 driverLatitude
                driverLng                                                           // 14 driverLongitude
        );
    }
}