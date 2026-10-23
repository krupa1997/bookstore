package com.bookstore.dto;

import com.bookstore.model.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private String id;
    private OrderStatus status;
    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();
    private AddressDto deliveryAddress;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingAmount;
    private BigDecimal totalAmount;
    private LocalDateTime canCancelUntil;
    private LocalDateTime createdAt;
}
