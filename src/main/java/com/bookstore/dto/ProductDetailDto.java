package com.bookstore.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailDto {
    private String id;
    private String title;
    private String author;
    private String isbn;
    private String description;
    private Integer pageCount;
    private CategoryDto category;
    private BrandDto brand;
    private BigDecimal price;
    private String currency;
    private String coverImageUrl;
    private boolean inStock;
    private LocalDate tentativeDeliveryDate;
}
