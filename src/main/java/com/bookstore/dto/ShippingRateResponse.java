package com.bookstore.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingRateResponse {
    private List<ShippingOptionDto> options;
}
