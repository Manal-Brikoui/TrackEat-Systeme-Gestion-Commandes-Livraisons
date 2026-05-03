package com.delivery.deliveryapp.restaurant;

import com.delivery.deliveryapp.auth.UserRepository;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.notification.EmailService;
import com.delivery.deliveryapp.restaurant.dto.*;
import com.delivery.deliveryapp.restaurant.entity.*;
import com.delivery.deliveryapp.shared.enums.RequestStatus;
import com.delivery.deliveryapp.shared.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final WorkingHoursRepository workingHoursRepository;
    private final EmailService emailService;


    public Category createCategory(Category request) {
        return categoryRepository.save(request);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category updateCategory(Long id, Category request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));
        category.setName(request.getName());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));
        categoryRepository.deleteById(id);
    }


    public RestaurantResponse applyAsRestaurant(RestaurantRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .imageUrl(request.getImageUrl())
                .description(request.getDescription())
                .open(false)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .requestStatus(RequestStatus.PENDING)
                .owner(owner)
                .category(category)
                .build();

        return toRestaurantResponse(restaurantRepository.save(restaurant));
    }

    public RestaurantResponse updateRequestStatus(Long restaurantId, String status) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));

        RequestStatus requestStatus = RequestStatus.valueOf(status);
        restaurant.setRequestStatus(requestStatus);

        if (requestStatus == RequestStatus.APPROVED) {
            User owner = restaurant.getOwner();
            owner.setRole(Role.RESTAURANT_ADMIN);
            userRepository.save(owner);
            restaurant.setOpen(true);
            emailService.sendRoleApprovedEmail(owner.getEmail(), owner.getFullName(), "RESTAURANT_ADMIN");
        }

        if (requestStatus == RequestStatus.REJECTED) {
            emailService.sendRoleRejectedEmail(
                    restaurant.getOwner().getEmail(),
                    restaurant.getOwner().getFullName(),
                    "RESTAURANT_ADMIN"
            );
        }

        return toRestaurantResponse(restaurantRepository.save(restaurant));
    }

    public RestaurantResponse updateLocation(Long id, Double latitude, Double longitude) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));
        restaurant.setLatitude(latitude);
        restaurant.setLongitude(longitude);
        return toRestaurantResponse(restaurantRepository.save(restaurant));
    }

    public List<RestaurantResponse> getPendingRequests() {
        return restaurantRepository.findByRequestStatus(RequestStatus.PENDING)
                .stream().map(this::toRestaurantResponse).collect(Collectors.toList());
    }

    public List<RestaurantResponse> getAllApproved() {
        return restaurantRepository.findByRequestStatus(RequestStatus.APPROVED)
                .stream().map(this::toRestaurantResponse).collect(Collectors.toList());
    }

    public List<RestaurantResponse> getByCategory(Long categoryId) {
        return restaurantRepository.findByCategoryId(categoryId)
                .stream().map(this::toRestaurantResponse).collect(Collectors.toList());
    }
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        if (request.getName() != null)        product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null)       product.setPrice(request.getPrice());
        if (request.getImageUrl() != null)    product.setImageUrl(request.getImageUrl());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        return toProductResponse(productRepository.save(product));
    }

    public RestaurantResponse getById(Long id) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));
        return toRestaurantResponse(r);
    }

    public RestaurantResponse getMyRestaurant() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Restaurant restaurant = restaurantRepository.findByOwnerId(owner.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));

        return toRestaurantResponse(restaurant);
    }

    public RestaurantResponse toggleOpen(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));
        restaurant.setOpen(!restaurant.isOpen());
        return toRestaurantResponse(restaurantRepository.save(restaurant));
    }

    public void delete(Long id) {
        restaurantRepository.deleteById(id);
    }


    public List<ProductResponse> getProductsByRestaurant(Long restaurantId) {
        return productRepository.findByRestaurantIdAndAvailableTrue(restaurantId)
                .stream().map(this::toProductResponse).collect(Collectors.toList());
    }

    public ProductResponse addProduct(ProductRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .available(true)
                .restaurant(restaurant)
                .category(category)
                .build();

        return toProductResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }


    private boolean isCurrentlyOpen(Restaurant r) {
        if (!r.isOpen()) return false;

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Africa/Casablanca"));
        int javaDow = now.getDayOfWeek().getValue();
        LocalTime nowTime = now.toLocalTime();

        List<WorkingHours> hours = workingHoursRepository.findByRestaurantId(r.getId());

        WorkingHours todayHours = hours.stream()
                .filter(h -> {
                    try { return Integer.parseInt(h.getDayOfWeek()) == javaDow; }
                    catch (NumberFormatException e) { return false; }
                })
                .findFirst()
                .orElse(null);

        if (todayHours == null) return true;

        if (todayHours.isClosed()) return false;

        try {
            LocalTime openTime  = LocalTime.parse(todayHours.getOpenTime());
            LocalTime closeTime = LocalTime.parse(todayHours.getCloseTime());
            return !nowTime.isBefore(openTime) && !nowTime.isAfter(closeTime);
        } catch (Exception e) {
            return true;
        }
    }

    private RestaurantResponse toRestaurantResponse(Restaurant r) {
        return new RestaurantResponse(
                r.getId(),
                r.getName(),
                r.getAddress(),
                r.getPhone(),
                r.getImageUrl(),
                r.isOpen(),
                r.getCategory() != null ? r.getCategory().getName() : null,
                r.getOwner() != null ? r.getOwner().getFullName() : null,
                r.getRequestStatus().name(),
                r.getLatitude(),
                r.getLongitude(),
                isCurrentlyOpen(r)
        );
    }

    private ProductResponse toProductResponse(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getImageUrl(),
                p.isAvailable(),
                p.getRestaurant() != null ? p.getRestaurant().getName() : null,
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null
        );
    }

    public RestaurantResponse updateInfo(UpdateRestaurantRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Restaurant restaurant = restaurantRepository.findByOwnerId(owner.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));

        if (request.getName() != null)        restaurant.setName(request.getName());
        if (request.getAddress() != null)     restaurant.setAddress(request.getAddress());
        if (request.getPhone() != null)       restaurant.setPhone(request.getPhone());
        if (request.getImageUrl() != null)    restaurant.setImageUrl(request.getImageUrl());
        if (request.getDescription() != null) restaurant.setDescription(request.getDescription());
        if (request.getLatitude() != null)    restaurant.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)   restaurant.setLongitude(request.getLongitude());

        return toRestaurantResponse(restaurantRepository.save(restaurant));
    }
}