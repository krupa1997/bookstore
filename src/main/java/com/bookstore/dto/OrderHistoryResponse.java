package com.bookstore.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderHistoryResponse {
    private List<OrderDto> orders;
    private long total;
    private int page;
}
