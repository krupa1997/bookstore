package com.bookstore.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletBalanceDto {
    private BigDecimal walletAmount;
    private int giftPoints;
    private BigDecimal pointsValueCurrency;
}
