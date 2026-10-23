package com.bookstore.controller;

import com.bookstore.dto.*;
import com.bookstore.security.UserPrincipal;
import com.bookstore.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order checkout, history, cancellation within 48h, buy-again, and returns")
@SecurityRequirement(name = "BearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Initiate checkout from cart")
    public ResponseEntity<OrderDto> checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckoutRequest request) {
        OrderDto order = orderService.checkout(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping
    @Operation(summary = "Retrieve order history")
    public ResponseEntity<OrderHistoryResponse> getOrderHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(orderService.getOrderHistory(principal.getId(), page, limit));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details")
    public ResponseEntity<OrderDto> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(principal.getId(), orderId));
    }

    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel order within the 48-hour cancellation window")
    public ResponseEntity<OrderDto> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String orderId,
            @Valid @RequestBody CancelOrderRequest request) {
        return ResponseEntity.ok(orderService.cancelOrder(principal.getId(), orderId, request));
    }

    @PostMapping("/{orderId}/buy-again")
    @Operation(summary = "Re-add items from previous order to cart (\"Buy It Again\")")
    public ResponseEntity<CartDto> buyItAgain(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String orderId) {
        return ResponseEntity.ok(orderService.buyItAgain(principal.getId(), orderId));
    }

    @PostMapping("/{orderId}/returns")
    @Operation(summary = "Request return for order or items")
    public ResponseEntity<ReturnResponseDto> requestReturn(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String orderId,
            @Valid @RequestBody ReturnRequestDto request) {
        ReturnResponseDto response = orderService.requestReturn(principal.getId(), orderId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
