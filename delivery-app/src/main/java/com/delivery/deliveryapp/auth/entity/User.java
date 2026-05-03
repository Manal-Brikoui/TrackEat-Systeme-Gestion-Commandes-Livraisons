package com.delivery.deliveryapp.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import com.delivery.deliveryapp.shared.enums.Role;
import java.time.LocalDateTime;
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    @Column
    private String resetToken;

    @Column
    private LocalDateTime resetTokenExpiry;
}