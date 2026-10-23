package com.bookstore.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    @NotBlank(message = "Delivery address ID is required")
    private String deliveryAddressId;

    @NotBlank(message = "Shipping method ID is required")
    private String shippingMethodId;

    private String couponCode;

    private Integer redeemGiftPoints;
}
