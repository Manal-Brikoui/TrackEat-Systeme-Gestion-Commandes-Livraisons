package com.delivery.deliveryapp.admin;

import com.delivery.deliveryapp.auth.UserRepository;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.driver.DriverRepository;
import com.delivery.deliveryapp.restaurant.RestaurantRepository;
import com.delivery.deliveryapp.shared.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final RestaurantRepository restaurantRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void removeRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (user.getRole() == Role.DRIVER) {
            driverRepository.findByUserId(userId)
                    .ifPresent(d -> {
                        d.setAvailable(false);
                        driverRepository.save(d);
                    });
        }

        if (user.getRole() == Role.RESTAURANT_ADMIN) {
            restaurantRepository.findByOwnerId(userId)
                    .forEach(r -> {
                        r.setOpen(false);
                        restaurantRepository.save(r);
                    });
        }

        user.setRole(Role.CLIENT);
        userRepository.save(user);
    }
}