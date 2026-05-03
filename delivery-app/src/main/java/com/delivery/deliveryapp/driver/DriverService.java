package com.delivery.deliveryapp.driver;

import com.delivery.deliveryapp.auth.UserRepository;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.driver.dto.*;
import com.delivery.deliveryapp.driver.entity.DriverProfile;
import com.delivery.deliveryapp.notification.EmailService;
import com.delivery.deliveryapp.shared.enums.RequestStatus;
import com.delivery.deliveryapp.shared.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public DriverResponse applyAsDriver(DriverRequest request) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (driverRepository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException("Demande déjà soumise");
        }

        DriverProfile profile = DriverProfile.builder()
                .user(user)
                .vehicle(request.getVehicle())
                .licenseNumber(request.getLicenseNumber())
                .photoUrl(request.getPhotoUrl())
                .bio(request.getBio())
                .rating(0.0)
                .available(false)
                .requestStatus(RequestStatus.PENDING)
                .build();

        return toDriverResponse(driverRepository.save(profile));
    }

    public DriverResponse updateRequestStatus(Long driverProfileId, String status) {
        DriverProfile profile = driverRepository.findById(driverProfileId)
                .orElseThrow(() -> new RuntimeException("Profil non trouvé"));

        RequestStatus requestStatus = RequestStatus.valueOf(status);
        profile.setRequestStatus(requestStatus);

        if (requestStatus == RequestStatus.APPROVED) {
            User user = profile.getUser();
            user.setRole(Role.DRIVER);
            userRepository.save(user);
            emailService.sendRoleApprovedEmail(
                    user.getEmail(),
                    user.getFullName(),
                    "DRIVER"
            );
        }

        if (requestStatus == RequestStatus.REJECTED) {
            emailService.sendRoleRejectedEmail(
                    profile.getUser().getEmail(),
                    profile.getUser().getFullName(),
                    "DRIVER"
            );
        }

        return toDriverResponse(driverRepository.save(profile));
    }

    public List<DriverResponse> getPendingRequests() {
        return driverRepository.findByRequestStatus(RequestStatus.PENDING)
                .stream().map(this::toDriverResponse)
                .collect(Collectors.toList());
    }

    public List<DriverResponse> getAvailableDrivers() {
        return driverRepository.findByAvailableTrue()
                .stream().map(this::toDriverResponse)
                .collect(Collectors.toList());
    }

    public DriverResponse getMyProfile() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        DriverProfile profile = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profil driver non trouvé"));

        return toDriverResponse(profile);
    }

    public DriverResponse toggleAvailability() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        DriverProfile profile = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profil driver non trouvé"));

        profile.setAvailable(!profile.isAvailable());
        return toDriverResponse(driverRepository.save(profile));
    }

    public DriverResponse updateLocation(Double latitude, Double longitude) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        DriverProfile profile = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profil driver non trouvé"));

        profile.setCurrentLatitude(latitude);
        profile.setCurrentLongitude(longitude);
        return toDriverResponse(driverRepository.save(profile));
    }

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll()
                .stream().map(this::toDriverResponse)
                .collect(Collectors.toList());
    }

    private DriverResponse toDriverResponse(DriverProfile p) {
        return new DriverResponse(
                p.getId(),
                p.getUser().getId(),
                p.getUser().getFullName(),
                p.getUser().getEmail(),
                p.getVehicle(),
                p.getLicenseNumber(),
                p.getRating(),
                p.isAvailable(),
                p.getCurrentLatitude(),
                p.getCurrentLongitude(),
                p.getRequestStatus().name()
        );
    }
}