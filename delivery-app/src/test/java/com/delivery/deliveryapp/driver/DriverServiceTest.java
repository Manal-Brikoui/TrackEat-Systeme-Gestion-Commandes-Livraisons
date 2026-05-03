package com.delivery.deliveryapp.driver;

import com.delivery.deliveryapp.auth.UserRepository;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.driver.dto.*;
import com.delivery.deliveryapp.driver.entity.DriverProfile;
import com.delivery.deliveryapp.notification.EmailService;
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
public class DriverServiceTest {

    @Mock private DriverRepository driverRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks
    private DriverService driverService;

    private User user;
    private DriverProfile driverProfile;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .fullName("Karim Driver")
                .email("karim@test.com")
                .role(Role.CLIENT)
                .build();

        driverProfile = DriverProfile.builder()
                .id(1L)
                .user(user)
                .vehicle("Moto Yamaha")
                .licenseNumber("AB-123-CD")
                .rating(0.0)
                .available(false)
                .requestStatus(RequestStatus.PENDING)
                .build();

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("karim@test.com");
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void applyAsDriver_success() {
        DriverRequest request = new DriverRequest();
        request.setVehicle("Moto Yamaha");
        request.setLicenseNumber("AB-123-CD");

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(driverRepository.findByUserId(any())).thenReturn(Optional.empty());
        when(driverRepository.save(any())).thenReturn(driverProfile);

        DriverResponse response = driverService.applyAsDriver(request);

        assertNotNull(response);
        assertEquals("PENDING", response.getStatus());
        assertEquals("Moto Yamaha", response.getVehicle());
    }

    @Test
    void applyAsDriver_alreadyApplied() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(driverRepository.findByUserId(any())).thenReturn(Optional.of(driverProfile));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> driverService.applyAsDriver(new DriverRequest()));

        assertEquals("Demande déjà soumise", ex.getMessage());
    }

    @Test
    void updateRequestStatus_approved() {
        when(driverRepository.findById(1L)).thenReturn(Optional.of(driverProfile));
        when(driverRepository.save(any())).thenReturn(driverProfile);
        when(userRepository.save(any())).thenReturn(user);
        doNothing().when(emailService).sendRoleApprovedEmail(any(), any(), any());

        driverService.updateRequestStatus(1L, "APPROVED");

        assertEquals(Role.DRIVER, user.getRole());
        verify(emailService, times(1)).sendRoleApprovedEmail(any(), any(), any());
    }

    @Test
    void updateRequestStatus_rejected() {
        when(driverRepository.findById(1L)).thenReturn(Optional.of(driverProfile));
        when(driverRepository.save(any())).thenReturn(driverProfile);
        doNothing().when(emailService).sendRoleRejectedEmail(any(), any(), any());

        driverService.updateRequestStatus(1L, "REJECTED");

        verify(emailService, times(1)).sendRoleRejectedEmail(any(), any(), any());
    }

    @Test
    void toggleAvailability_success() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(driverRepository.findByUserId(any())).thenReturn(Optional.of(driverProfile));
        when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        driverService.toggleAvailability();

        assertTrue(driverProfile.isAvailable()); // était false → devient true
        verify(driverRepository, times(1)).save(any());
    }

    @Test
    void getAvailableDrivers_success() {
        driverProfile.setAvailable(true);
        when(driverRepository.findByAvailableTrue()).thenReturn(List.of(driverProfile));

        List<DriverResponse> responses = driverService.getAvailableDrivers();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertTrue(responses.get(0).isAvailable());
    }

    @Test
    void getMyProfile_success() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(driverRepository.findByUserId(any())).thenReturn(Optional.of(driverProfile));

        DriverResponse response = driverService.getMyProfile();

        assertNotNull(response);
        assertEquals("Karim Driver", response.getFullName());
        assertEquals("Moto Yamaha", response.getVehicle());
    }

    @Test
    void getMyProfile_notFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(driverRepository.findByUserId(any())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> driverService.getMyProfile());

        assertEquals("Profil driver non trouvé", ex.getMessage());
    }

    @Test
    void updateLocation_success() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(driverRepository.findByUserId(any())).thenReturn(Optional.of(driverProfile));
        when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        driverService.updateLocation(33.5731, -7.5898);

        assertEquals(33.5731, driverProfile.getCurrentLatitude());
        assertEquals(-7.5898, driverProfile.getCurrentLongitude());
        verify(driverRepository, times(1)).save(any());
    }

    @Test
    void getAllDrivers_success() {
        when(driverRepository.findAll()).thenReturn(List.of(driverProfile));

        List<DriverResponse> responses = driverService.getAllDrivers();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Karim Driver", responses.get(0).getFullName());
    }
}