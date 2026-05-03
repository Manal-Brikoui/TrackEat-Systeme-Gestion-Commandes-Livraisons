package com.delivery.deliveryapp.restaurant;

import com.delivery.deliveryapp.restaurant.dto.*;
import com.delivery.deliveryapp.restaurant.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkingHoursService {

    private final WorkingHoursRepository workingHoursRepository;
    private final RestaurantRepository restaurantRepository;

    public List<WorkingHoursResponse> getByRestaurant(Long restaurantId) {
        return workingHoursRepository.findByRestaurantId(restaurantId)
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<WorkingHoursResponse> updateHours(WorkingHoursRequest request) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        Restaurant restaurant = restaurantRepository.findAll()
                .stream()
                .filter(r -> r.getOwner().getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Restaurant non trouve"));

        workingHoursRepository.deleteByRestaurantId(restaurant.getId());

        List<WorkingHours> hours = request.getHours().stream().map(h -> {
            String open  = h.isClosed() ? "00:00" : h.getOpenTime();
            String close = h.isClosed() ? "00:00" : h.getCloseTime();
            String dow = String.valueOf(h.getDayOfWeek());
            return WorkingHours.builder()
                    .restaurant(restaurant)
                    .dayOfWeek(dow)
                    .openTime(open)
                    .closeTime(close)
                    .closed(h.isClosed())
                    .build();
        }).collect(Collectors.toList());

        return workingHoursRepository.saveAll(hours)
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    private WorkingHoursResponse toResponse(WorkingHours w) {
        Integer dow = null;
        try {
            dow = Integer.parseInt(w.getDayOfWeek());
        } catch (NumberFormatException e) {
            dow = 0;
        }
        return new WorkingHoursResponse(
                w.getId(),
                dow,
                w.getOpenTime(),
                w.getCloseTime(),
                w.isClosed()
        );
    }
}