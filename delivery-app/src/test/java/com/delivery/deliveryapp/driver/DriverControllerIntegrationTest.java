package com.delivery.deliveryapp.driver;

import com.delivery.deliveryapp.auth.dto.AuthResponse;
import com.delivery.deliveryapp.auth.dto.RegisterRequest;
import com.delivery.deliveryapp.driver.dto.DriverRequest;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DriverControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private String tokenDriver;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Karim Driver Test");
        request.setEmail("driver_test_" + System.currentTimeMillis() + "@test.com");
        request.setPassword("123456");
        request.setPhone("0600000044");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                result.getResponse().getContentAsString(), AuthResponse.class);
        tokenDriver = authResponse.getToken();
    }

    @Test
    void applyAsDriver_success() throws Exception {
        DriverRequest request = new DriverRequest();
        request.setVehicle("Moto Yamaha");
        request.setLicenseNumber("AB-123-CD");
        request.setBio("5 ans experience");

        mockMvc.perform(post("/api/drivers/apply")
                        .header("Authorization", "Bearer " + tokenDriver)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.vehicle").value("Moto Yamaha"));
    }
    @Test
    void getAvailableDrivers_success() throws Exception {
        mockMvc.perform(get("/api/drivers/available")
                        .header("Authorization", "Bearer " + tokenDriver))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getMyProfile_notFound() throws Exception {
        mockMvc.perform(get("/api/drivers/me")
                        .header("Authorization", "Bearer " + tokenDriver))
                .andExpect(status().is5xxServerError());
    }
}