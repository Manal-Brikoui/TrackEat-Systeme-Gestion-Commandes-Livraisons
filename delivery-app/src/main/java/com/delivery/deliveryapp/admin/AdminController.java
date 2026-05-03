package com.delivery.deliveryapp.admin;

import com.delivery.deliveryapp.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{id}/remove-role")
    public ResponseEntity<Void> removeRole(@PathVariable Long id) {
        adminService.removeRole(id);
        return ResponseEntity.noContent().build();
    }
}