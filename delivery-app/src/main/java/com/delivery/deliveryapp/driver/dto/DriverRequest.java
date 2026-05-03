package com.delivery.deliveryapp.driver.dto;

import lombok.Data;

@Data
public class DriverRequest {
    private String vehicle;
    private String vehicleType;
    private String licenseNumber;
    private String licensePlate;
    private String photoUrl;
    private String licenseImageUrl;
    private String vehicleImageUrl;
    private String bio;
    private String phone;
    private String city;

    public String getVehicle() {
        return vehicle != null ? vehicle : vehicleType;
    }

    public String getLicenseNumber() {
        return licenseNumber != null ? licenseNumber : licensePlate;
    }

    public String getPhotoUrl() {
        return photoUrl != null ? photoUrl : licenseImageUrl;
    }
}