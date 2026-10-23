package com.bookstore.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmPaymentRequest {

    @NotBlank(message = "Payment ID is required")
    private String paymentId;

    @NotBlank(message = "Gateway transaction ID is required")
    private String gatewayTransactionId;

    @NotBlank(message = "Status is required (SUCCESS / FAILED)")
    private String status;
}
