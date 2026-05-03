package com.delivery.deliveryapp.auth.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String currentPassword;
    private String newPassword;
}