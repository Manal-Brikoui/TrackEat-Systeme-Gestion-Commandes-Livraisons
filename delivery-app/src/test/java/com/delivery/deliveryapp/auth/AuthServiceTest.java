package com.delivery.deliveryapp.auth;

import com.delivery.deliveryapp.auth.dto.*;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.notification.EmailService;
import com.delivery.deliveryapp.shared.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("Ahmed Test");
        registerRequest.setEmail("ahmed@test.com");
        registerRequest.setPassword("123456");
        registerRequest.setPhone("0600000001");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("ahmed@test.com");
        loginRequest.setPassword("123456");

        user = User.builder()
                .id(1L)
                .fullName("Ahmed Test")
                .email("ahmed@test.com")
                .password("encodedPassword")
                .phone("0600000001")
                .role(Role.CLIENT)
                .build();
    }

    @Test
    void register_success() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any())).thenReturn(user);
        when(jwtUtil.generateToken(any(), any())).thenReturn("token123");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("token123", response.getToken());
        assertEquals("CLIENT", response.getRole());
        assertEquals("Ahmed Test", response.getFullName());
        verify(userRepository, times(1)).save(any());
    }

    @Test
    void register_emailAlreadyUsed() {
        when(userRepository.existsByEmail(any())).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.register(registerRequest));

        assertEquals("Email déjà utilisé", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_success() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtUtil.generateToken(any(), any())).thenReturn("token123");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("token123", response.getToken());
        assertEquals("CLIENT", response.getRole());
    }

    @Test
    void login_wrongPassword() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.login(loginRequest));

        assertEquals("Mot de passe incorrect", ex.getMessage());
    }

    @Test
    void login_userNotFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.login(loginRequest));

        assertEquals("Utilisateur non trouvé", ex.getMessage());
    }

    @Test
    void forgotPassword_userNotFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.forgotPassword("notexist@test.com"));

        assertEquals("Email non trouvé", ex.getMessage());
    }

    @Test
    void forgotPassword_success() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        doNothing().when(emailService).sendResetEmail(any(), any());

        authService.forgotPassword("ahmed@test.com");

        verify(userRepository, times(1)).save(any());
        verify(emailService, times(1)).sendResetEmail(any(), any());
    }
}