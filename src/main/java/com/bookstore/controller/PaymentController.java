package com.bookstore.controller;

import com.bookstore.dto.*;
import com.bookstore.security.UserPrincipal;
import com.bookstore.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments & Wallet", description = "Payment initiation, confirmation, gateway callback, refund, and wallet points")
@SecurityRequirement(name = "BearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @Operation(summary = "Initiate payment for an order with selected option")
    public ResponseEntity<PaymentSessionDto> initiatePayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InitiatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.initiatePayment(principal.getId(), request));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Confirm payment completion from gateway callback")
    public ResponseEntity<PaymentConfirmationDto> confirmPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ConfirmPaymentRequest request) {
        return ResponseEntity.ok(paymentService.confirmPayment(principal.getId(), request));
    }

    @GetMapping("/wallet")
    @Operation(summary = "Get user wallet balance and gift points")
    public ResponseEntity<WalletBalanceDto> getWallet(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paymentService.getWalletBalance(principal.getId()));
    }

    @PostMapping("/wallet/redeem-points")
    @Operation(summary = "Redeem gift points / coupons for order discount")
    public ResponseEntity<DiscountSummaryDto> redeemPoints(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RedeemPointsRequest request) {
        return ResponseEntity.ok(paymentService.redeemGiftPoints(principal.getId(), request));
    }
}
