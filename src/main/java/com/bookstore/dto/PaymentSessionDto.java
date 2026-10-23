package com.bookstore.dto;

import com.bookstore.model.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSessionDto {
    private String paymentId;
    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String gatewayRedirectUrl;
    private PaymentStatus paymentStatus;
}
