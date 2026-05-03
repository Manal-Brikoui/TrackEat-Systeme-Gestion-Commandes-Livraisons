package com.delivery.deliveryapp.driver;

import com.delivery.deliveryapp.driver.entity.DriverProfile;
import com.delivery.deliveryapp.shared.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<DriverProfile, Long> {
    List<DriverProfile> findByAvailableTrue();
    Optional<DriverProfile> findByUserId(Long userId);
    List<DriverProfile> findByRequestStatus(RequestStatus requestStatus);
}