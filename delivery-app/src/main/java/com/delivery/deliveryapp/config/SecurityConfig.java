package com.delivery.deliveryapp.config;

import com.delivery.deliveryapp.auth.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth


                        .requestMatchers("/api/auth/**").permitAll()


                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/ws/info").permitAll()
                        .requestMatchers("/ws/info/**").permitAll()

                        .requestMatchers("/api/tracking/**").permitAll()
                        .requestMatchers("/api/working-hours/restaurant/**").permitAll()
                        .requestMatchers("/api/reviews/restaurant/**").permitAll()
                        .requestMatchers("/api/tracking/**").permitAll()

                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/v3/api-docs").permitAll()


                        .requestMatchers("/api/drivers/pending").hasAuthority("ADMIN")
                        .requestMatchers("/api/drivers/*/status").hasAuthority("ADMIN")
                        .requestMatchers("/api/restaurants/pending").hasAuthority("ADMIN")
                        .requestMatchers("/api/restaurants/*/status").hasAuthority("ADMIN")
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")


                        .requestMatchers("/api/restaurants/categories").authenticated()
                        .requestMatchers("/api/restaurants/apply").authenticated()
                        .requestMatchers("/api/restaurants/my").authenticated()
                        .requestMatchers("/api/restaurants/my/info").authenticated()
                        .requestMatchers("/api/restaurants/category/**").authenticated()
                        .requestMatchers("/api/restaurants/**").authenticated()
                        .requestMatchers("/api/restaurants").permitAll()
                        .requestMatchers("/api/drivers/apply").authenticated()
                        .requestMatchers("/api/drivers/available").authenticated()
                        .requestMatchers("/api/drivers/me").authenticated()
                        .requestMatchers("/api/drivers/toggle").authenticated()
                        .requestMatchers("/api/drivers/location").authenticated()
                        .requestMatchers("/api/drivers/**").authenticated()

                        .requestMatchers("/api/orders/available").authenticated()
                        .requestMatchers("/api/orders/restaurant/**").authenticated()
                        .requestMatchers("/api/orders/driver/**").authenticated()
                        .requestMatchers("/api/orders/*/accept").authenticated()
                        .requestMatchers("/api/orders/*/reject").authenticated()
                        .requestMatchers("/api/orders/*/deliver").authenticated()
                        .requestMatchers("/api/orders/**").authenticated()

                        .requestMatchers("/api/payments/**").authenticated()

                        .requestMatchers("/api/reviews").authenticated()
                        .requestMatchers("/api/reviews/**").authenticated()

                        .requestMatchers("/api/notifications/**").authenticated()

                        .requestMatchers("/api/working-hours").authenticated()
                        .requestMatchers("/api/working-hours/**").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}