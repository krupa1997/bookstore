package com.bookstore.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingRateRequest {

    @NotBlank(message = "Delivery postal code is required")
    private String deliveryPostalCode;

    @NotBlank(message = "Cart ID is required")
    private String cartId;
}
