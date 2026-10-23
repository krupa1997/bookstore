package com.bookstore.controller;

import com.bookstore.dto.ShippingRateRequest;
import com.bookstore.dto.ShippingRateResponse;
import com.bookstore.service.ShippingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/shipping")
@RequiredArgsConstructor
@Tag(name = "Shipping & Fulfillment", description = "Calculate rates, estimate tentative delivery, and return shipments")
public class ShippingController {

    private final ShippingService shippingService;

    @PostMapping("/calculate-rate")
    @Operation(summary = "Calculate shipping rate and estimate delivery time")
    public ResponseEntity<ShippingRateResponse> calculateRate(@Valid @RequestBody ShippingRateRequest request) {
        return ResponseEntity.ok(shippingService.calculateShipping(request));
    }
}
