package com.delivery.deliveryapp.notification;

import com.delivery.deliveryapp.auth.UserRepository;
import com.delivery.deliveryapp.auth.entity.User;
import com.delivery.deliveryapp.notification.dto.NotificationResponse;
import com.delivery.deliveryapp.notification.entity.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    public void sendNotification(User user, String message, String type, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();

        notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                toNotificationResponse(notification)
        );

        emailService.sendNotificationEmail(user.getEmail(), user.getFullName(), message);
    }

    public List<NotificationResponse> getMyNotifications() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toNotificationResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    public void markAllRead() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Notification> unread = notificationRepository
                .findByUserIdAndReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toNotificationResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getReferenceId(),
                n.getCreatedAt()
        );
    }
}