package com.bookstore.dto;

import com.bookstore.model.PaymentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentConfirmationDto {
    private String paymentId;
    private String orderId;
    private PaymentStatus status;
    private LocalDateTime transactionTimestamp;
}
