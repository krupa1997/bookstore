package com.bookstore.controller;

import com.bookstore.dto.*;
import com.bookstore.security.UserPrincipal;
import com.bookstore.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Auth & Member", description = "User registration, authentication, profile, addresses, and entitlements")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/auth/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/auth/login")
    @Operation(summary = "User authentication (Registered / Guest to Auth)")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/logout")
    @Operation(summary = "Logout active session", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/members/me/addresses")
    @Operation(summary = "Get user saved delivery addresses", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<AddressDto>> getAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        List<AddressDto> addresses = authService.getUserAddresses(principal.getId());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/members/me/addresses")
    @Operation(summary = "Add new delivery address", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<AddressDto> addAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddressInput input) {
        AddressDto address = authService.addAddress(principal.getId(), input);
        return ResponseEntity.status(HttpStatus.CREATED).body(address);
    }
}
