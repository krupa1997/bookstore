package com.bookstore.service;

import com.bookstore.dto.ShippingOptionDto;
import com.bookstore.dto.ShippingRateRequest;
import com.bookstore.dto.ShippingRateResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ShippingService {

    public ShippingRateResponse calculateShipping(ShippingRateRequest request) {
        int extraDays = (request.getDeliveryPostalCode() != null && request.getDeliveryPostalCode().startsWith("9")) ? 2 : 0;

        ShippingOptionDto standard = ShippingOptionDto.builder()
                .shippingMethodId("standard-ground")
                .name("Standard Ground Shipping (3-5 business days)")
                .cost(BigDecimal.valueOf(4.99))
                .tentativeDeliveryDate(LocalDate.now().plusDays(4 + extraDays))
                .build();

        ShippingOptionDto express = ShippingOptionDto.builder()
                .shippingMethodId("express-priority")
                .name("Express Priority Shipping (1-2 business days)")
                .cost(BigDecimal.valueOf(9.99))
                .tentativeDeliveryDate(LocalDate.now().plusDays(2 + extraDays))
                .build();

        ShippingOptionDto freeSuperSaver = ShippingOptionDto.builder()
                .shippingMethodId("super-saver")
                .name("Free Super Saver Shipping (5-7 business days)")
                .cost(BigDecimal.ZERO)
                .tentativeDeliveryDate(LocalDate.now().plusDays(7 + extraDays))
                .build();

        return ShippingRateResponse.builder()
                .options(List.of(standard, express, freeSuperSaver))
                .build();
    }
}
