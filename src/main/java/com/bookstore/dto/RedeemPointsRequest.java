package com.bookstore.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedeemPointsRequest {

    @Min(value = 1, message = "Points to redeem must be greater than 0")
    private int pointsToRedeem;
}
