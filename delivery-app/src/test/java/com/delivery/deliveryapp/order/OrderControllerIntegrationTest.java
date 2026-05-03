package com.delivery.deliveryapp.order;

import com.delivery.deliveryapp.auth.dto.AuthResponse;
import com.delivery.deliveryapp.auth.dto.RegisterRequest;
import com.delivery.deliveryapp.order.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class OrderControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private String tokenClient;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Ahmed Order Test");
        request.setEmail("order_test_" + System.currentTimeMillis() + "@test.com");
        request.setPassword("123456");
        request.setPhone("0600000055");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                result.getResponse().getContentAsString(), AuthResponse.class);
        tokenClient = authResponse.getToken();
    }

    @Test
    void getMyOrders_empty() throws Exception {
        mockMvc.perform(get("/api/orders/my")
                        .header("Authorization", "Bearer " + tokenClient))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getById_notFound() throws Exception {
        mockMvc.perform(get("/api/orders/9999")
                        .header("Authorization", "Bearer " + tokenClient))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void createOrder_withoutToken_forbidden() throws Exception {
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(1);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setRestaurantId(1L);
        request.setDeliveryAddress("12 Rue Hassan II");
        request.setPaymentMethod("CASH");
        request.setItems(List.of(item));

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createOrder_clientForbidden() throws Exception {
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(999L);
        item.setQuantity(1);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setRestaurantId(999L);
        request.setDeliveryAddress("12 Rue Hassan II");
        request.setPaymentMethod("CASH");
        request.setItems(List.of(item));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + tokenClient)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void cancelOrder_notFound() throws Exception {
        mockMvc.perform(patch("/api/orders/9999/cancel")
                        .header("Authorization", "Bearer " + tokenClient))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void getAvailableOrders_clientForbidden() throws Exception {
        mockMvc.perform(get("/api/orders/available")
                        .header("Authorization", "Bearer " + tokenClient))
                .andExpect(status().isForbidden());
    }
}