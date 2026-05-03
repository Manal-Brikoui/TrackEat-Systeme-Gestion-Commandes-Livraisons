package com.delivery.deliveryapp.payment;

import com.delivery.deliveryapp.order.OrderRepository;
import com.delivery.deliveryapp.order.entity.Order;
import com.delivery.deliveryapp.payment.dto.*;
import com.delivery.deliveryapp.payment.entity.Payment;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.currency}")
    private String currency;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        if ("CASH".equals(order.getPaymentMethod())) {
            Payment payment = Payment.builder()
                    .order(order)
                    .amount(order.getTotalPrice())
                    .status("PENDING_CASH")
                    .stripePaymentId(null)
                    .currency("mad")
                    .build();

            return toPaymentResponse(paymentRepository.save(payment));
        }

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long)(order.getTotalPrice() * 100))
                    .setCurrency(currency)
                    .setPaymentMethod(request.getPaymentMethodId())
                    .setConfirm(true)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .setAllowRedirects(
                                            PaymentIntentCreateParams.AutomaticPaymentMethods
                                                    .AllowRedirects.NEVER)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            Payment payment = Payment.builder()
                    .order(order)
                    .amount(order.getTotalPrice())
                    .status(intent.getStatus())
                    .stripePaymentId(intent.getId())
                    .currency(currency)
                    .build();

            return toPaymentResponse(paymentRepository.save(payment));

        } catch (Exception e) {
            throw new RuntimeException("Erreur paiement : " + e.getMessage());
        }
    }

    @Transactional
    public PaymentResponse getByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));
        return toPaymentResponse(payment);
    }

    private PaymentResponse toPaymentResponse(Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getOrder().getId(),
                p.getAmount(),
                p.getStatus(),
                p.getStripePaymentId(),
                p.getCurrency()
        );
    }
}