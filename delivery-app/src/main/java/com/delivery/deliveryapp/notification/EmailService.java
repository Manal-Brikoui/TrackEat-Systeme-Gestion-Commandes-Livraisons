package com.delivery.deliveryapp.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendResetEmail(String toEmail, String resetToken) {
        send(
                toEmail,
                "Réinitialisation de mot de passe",
                "Clique sur ce lien pour réinitialiser ton mot de passe :\n\n" +
                        "http://localhost:5173/reset-password?token=" + resetToken +
                        "\n\nCe lien expire dans 15 minutes."
        );
    }

    public void sendRoleApprovedEmail(String toEmail, String fullName, String role) {
        String roleLabel = role.equals("DRIVER") ? "livreur" : "restaurant";
        send(
                toEmail,
                "Demande approuvée",
                "Bonjour " + fullName + ",\n\n" +
                        "Votre demande pour devenir " + roleLabel + " a été approuvée.\n" +
                        "Vous pouvez maintenant vous connecter avec votre nouveau rôle."
        );
    }

    public void sendRoleRejectedEmail(String toEmail, String fullName, String role) {
        String roleLabel = role.equals("DRIVER") ? "livreur" : "restaurant";
        send(
                toEmail,
                "Demande rejetée",
                "Bonjour " + fullName + ",\n\n" +
                        "Votre demande pour devenir " + roleLabel + " a été rejetée.\n" +
                        "Contactez le support pour plus d'informations."
        );
    }

    public void sendNotificationEmail(String toEmail, String fullName, String message) {
        try {
            send(
                    toEmail,
                    "Nouvelle notification - Delivery App",
                    "Bonjour " + fullName + ",\n\n" +
                            message +
                            "\n\nL'équipe TrackEat "
            );
        } catch (Exception e) {
            System.err.println("Email notification failed: " + e.getMessage());
        }
    }

    private void send(String toEmail, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}