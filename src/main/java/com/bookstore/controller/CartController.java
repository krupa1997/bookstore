package com.bookstore.controller;

import com.bookstore.dto.*;
import com.bookstore.security.UserPrincipal;
import com.bookstore.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Tag(name = "Cart & Basket", description = "Cart operations, items addition, and discount management")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current active cart", security = {
            @SecurityRequirement(name = "BearerAuth"),
            @SecurityRequirement(name = "GuestCartToken")
    })
    public ResponseEntity<CartDto> getCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken) {
        String userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(cartService.getCart(userId, guestToken));
    }

    @PostMapping
    @Operation(summary = "Add product(s) to basket", security = {
            @SecurityRequirement(name = "BearerAuth"),
            @SecurityRequirement(name = "GuestCartToken")
    })
    public ResponseEntity<CartDto> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
            @Valid @RequestBody AddToCartRequest request) {
        String userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(cartService.addToCart(userId, guestToken, request));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update quantity of an item in cart", security = {
            @SecurityRequirement(name = "BearerAuth"),
            @SecurityRequirement(name = "GuestCartToken")
    })
    public ResponseEntity<CartDto> updateCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
            @PathVariable String itemId,
            @RequestBody Map<String, Integer> payload) {
        String userId = principal != null ? principal.getId() : null;
        int quantity = payload.getOrDefault("quantity", 1);
        return ResponseEntity.ok(cartService.updateCartItem(userId, guestToken, itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart", security = {
            @SecurityRequirement(name = "BearerAuth"),
            @SecurityRequirement(name = "GuestCartToken")
    })
    public ResponseEntity<CartDto> removeCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
            @PathVariable String itemId) {
        String userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(cartService.removeCartItem(userId, guestToken, itemId));
    }
}
