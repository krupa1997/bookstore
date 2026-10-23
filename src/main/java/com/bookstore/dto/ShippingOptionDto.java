package com.bookstore.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingOptionDto {
    private String shippingMethodId;
    private String name;
    private BigDecimal cost;
    private LocalDate tentativeDeliveryDate;
}
