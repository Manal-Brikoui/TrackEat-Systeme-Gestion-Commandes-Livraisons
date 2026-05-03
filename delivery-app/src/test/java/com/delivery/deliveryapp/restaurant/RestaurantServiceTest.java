package com.delivery.deliveryapp.restaurant;

import com.delivery.deliveryapp.auth.UserRepository;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.notification.EmailService;
import com.delivery.deliveryapp.restaurant.dto.*;
import com.delivery.deliveryapp.restaurant.entity.*;
import com.delivery.deliveryapp.shared.enums.RequestStatus;
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
public class RestaurantServiceTest {

    @Mock private RestaurantRepository restaurantRepository;
    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private WorkingHoursRepository workingHoursRepository;
    @Mock private EmailService emailService;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks
    private RestaurantService restaurantService;

    private User owner;
    private Category category;
    private Restaurant restaurant;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(1L)
                .fullName("Hassan")
                .email("hassan@test.com")
                .role(Role.CLIENT)
                .build();

        category = Category.builder()
                .id(1L)
                .name("Pizza")
                .build();

        restaurant = Restaurant.builder()
                .id(1L)
                .name("Pizza House")
                .address("12 Rue Hassan II")
                .phone("0600000010")
                .open(false)
                .requestStatus(RequestStatus.PENDING)
                .owner(owner)
                .category(category)
                .build();

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("hassan@test.com");

        lenient().when(workingHoursRepository.findByRestaurantId(any()))
                .thenReturn(List.of());

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void applyAsRestaurant_success() {
        RestaurantRequest request = new RestaurantRequest();
        request.setName("Pizza House");
        request.setAddress("12 Rue Hassan II");
        request.setPhone("0600000010");
        request.setCategoryId(1L);

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(owner));
        when(categoryRepository.findById(any())).thenReturn(Optional.of(category));
        when(restaurantRepository.save(any())).thenReturn(restaurant);

        RestaurantResponse response = restaurantService.applyAsRestaurant(request);

        assertNotNull(response);
        assertEquals("Pizza House", response.getName());
        assertEquals("PENDING", response.getRequestStatus());
    }

    @Test
    void updateRequestStatus_approved() {
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurant));
        when(restaurantRepository.save(any())).thenReturn(restaurant);
        when(userRepository.save(any())).thenReturn(owner);
        doNothing().when(emailService).sendRoleApprovedEmail(any(), any(), any());

        restaurantService.updateRequestStatus(1L, "APPROVED");

        assertEquals(Role.RESTAURANT_ADMIN, owner.getRole());
        verify(emailService, times(1)).sendRoleApprovedEmail(any(), any(), any());
    }

    @Test
    void updateRequestStatus_rejected() {
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurant));
        when(restaurantRepository.save(any())).thenReturn(restaurant);
        doNothing().when(emailService).sendRoleRejectedEmail(any(), any(), any());

        restaurantService.updateRequestStatus(1L, "REJECTED");

        verify(emailService, times(1)).sendRoleRejectedEmail(any(), any(), any());
    }

    @Test
    void getById_success() {
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurant));

        RestaurantResponse response = restaurantService.getById(1L);

        assertNotNull(response);
        assertEquals("Pizza House", response.getName());
    }

    @Test
    void getById_notFound() {
        when(restaurantRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> restaurantService.getById(99L));

        assertEquals("Restaurant non trouvé", ex.getMessage());
    }

    @Test
    void getAllApproved_success() {
        when(restaurantRepository.findByRequestStatus(RequestStatus.APPROVED))
                .thenReturn(List.of(restaurant));

        List<RestaurantResponse> responses = restaurantService.getAllApproved();

        assertNotNull(responses);
        assertEquals(1, responses.size());
    }

    @Test
    void getMyRestaurant_success() {
        when(userRepository.findByEmail("hassan@test.com")).thenReturn(Optional.of(owner));
        when(restaurantRepository.findByOwnerId(1L)).thenReturn(List.of(restaurant));

        RestaurantResponse response = restaurantService.getMyRestaurant();

        assertNotNull(response);
        assertEquals("Pizza House", response.getName());
    }

    @Test
    void toggleOpen_success() {
        restaurant = Restaurant.builder()
                .id(1L)
                .name("Pizza House")
                .address("12 Rue Hassan II")
                .phone("0600000010")
                .open(false)
                .requestStatus(RequestStatus.PENDING)
                .owner(owner)
                .category(category)
                .build();

        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurant));
        when(restaurantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RestaurantResponse response = restaurantService.toggleOpen(1L);

        assertTrue(response.isOpen());
    }

    @Test
    void deleteProduct_success() {
        doNothing().when(productRepository).deleteById(1L);

        restaurantService.deleteProduct(1L);

        verify(productRepository, times(1)).deleteById(1L);
    }

    @Test
    void updateInfo_success() {
        UpdateRestaurantRequest request = new UpdateRestaurantRequest();
        request.setName("New Name");

        when(userRepository.findByEmail("hassan@test.com")).thenReturn(Optional.of(owner));
        when(restaurantRepository.findByOwnerId(1L)).thenReturn(List.of(restaurant));
        when(restaurantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RestaurantResponse response = restaurantService.updateInfo(request);

        assertEquals("New Name", response.getName());
    }
}