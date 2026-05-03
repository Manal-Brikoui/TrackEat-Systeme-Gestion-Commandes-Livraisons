package com.delivery.deliveryapp.driver.entity;

import com.delivery.deliveryapp.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import com.delivery.deliveryapp.shared.enums.RequestStatus;
@Entity
@Table(name = "driver_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String vehicle;

    @Column(nullable = false)
    private String licenseNumber;

    private String photoUrl;

    private String bio;

    private Double rating;

    private boolean available;

    private Double currentLatitude;

    private Double currentLongitude;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RequestStatus requestStatus;
}