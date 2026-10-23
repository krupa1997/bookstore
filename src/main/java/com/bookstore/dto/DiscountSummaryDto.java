package com.bookstore.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountSummaryDto {
    private int pointsRedeemed;
    private BigDecimal discountAmount;
    private BigDecimal newCartTotal;
}
