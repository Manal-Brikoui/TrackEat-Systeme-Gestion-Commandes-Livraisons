package com.delivery.deliveryapp.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "working_hours")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkingHours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @Column(nullable = false)
    private String dayOfWeek;

    @Column(nullable = false)
    private String openTime;

    @Column(nullable = false)
    private String closeTime;

    private boolean closed;
}