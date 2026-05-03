package com.delivery.deliveryapp.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String role;
    private String fullName;
    private Long id;
    private String email;
    private String phone;
}