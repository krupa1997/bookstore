package com.bookstore.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPaginationDto {
    private List<ProductDto> items;
    private long total;
    private int page;
    private int totalPages;
}
