package com.bookstore.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private String id;
    private String title;
    private String author;
    private CategoryDto category;
    private BrandDto brand;
    private BigDecimal price;
    private String currency;
    private String coverImageUrl;
    private boolean inStock;
}
