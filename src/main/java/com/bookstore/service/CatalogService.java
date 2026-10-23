package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.model.*;
import com.bookstore.repository.BrandRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToCategoryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BrandDto> getBrands() {
        return brandRepository.findAll().stream()
                .map(this::mapToBrandDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductPaginationDto getProducts(String categoryId, String brandId, String search, int page, int limit) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit);
        Page<Product> productPage = productRepository.findProductsByFilter(categoryId, brandId, search, pageable);

        List<ProductDto> dtos = productPage.getContent().stream()
                .map(this::mapToProductDto)
                .collect(Collectors.toList());

        return ProductPaginationDto.builder()
                .items(dtos)
                .total(productPage.getTotalElements())
                .page(page)
                .totalPages(productPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public ProductDetailDto getProductById(String productId, String postalCode) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with id: " + productId));

        int deliveryDays = product.getEstimatedDeliveryDays() != null ? product.getEstimatedDeliveryDays() : 3;
        // Postal code adjustment simulation
        if (postalCode != null && postalCode.startsWith("9")) {
            deliveryDays += 2;
        }
        LocalDate tentativeDate = LocalDate.now().plusDays(deliveryDays);

        return ProductDetailDto.builder()
                .id(product.getId())
                .title(product.getTitle())
                .author(product.getAuthor())
                .isbn(product.getIsbn())
                .description(product.getDescription())
                .pageCount(product.getPageCount())
                .category(mapToCategoryDto(product.getCategory()))
                .brand(mapToBrandDto(product.getBrand()))
                .price(product.getPrice())
                .currency(product.getCurrency())
                .coverImageUrl(product.getCoverImageUrl())
                .inStock(product.isInStock())
                .tentativeDeliveryDate(tentativeDate)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getRelatedProducts(String productId, String type) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with id: " + productId));

        if (product.getRelatedProducts() != null && !product.getRelatedProducts().isEmpty()) {
            return product.getRelatedProducts().stream()
                    .map(this::mapToProductDto)
                    .collect(Collectors.toList());
        }

        // Fallback: items in the same category
        if (product.getCategory() != null) {
            Pageable pageable = PageRequest.of(0, 4);
            return productRepository.findProductsByFilter(product.getCategory().getId(), null, null, pageable)
                    .getContent().stream()
                    .filter(p -> !p.getId().equals(productId))
                    .map(this::mapToProductDto)
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getRecommendations(String userId) {
        List<Order> userOrders = orderRepository.findByUserId(userId);
        Set<String> preferredCategoryIds = userOrders.stream()
                .flatMap(order -> order.getItems().stream())
                .map(item -> item.getProduct().getCategory() != null ? item.getProduct().getCategory().getId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (!preferredCategoryIds.isEmpty()) {
            List<Product> recommended = productRepository.findTopRecommendationsByCategories(
                    new ArrayList<>(preferredCategoryIds), PageRequest.of(0, 6)
            );
            return recommended.stream().map(this::mapToProductDto).collect(Collectors.toList());
        }

        // Fallback for new users: Top 6 products in catalog
        return productRepository.findAll(PageRequest.of(0, 6))
                .getContent().stream()
                .map(this::mapToProductDto)
                .collect(Collectors.toList());
    }

    public CategoryDto mapToCategoryDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .slug(category.getSlug())
                .build();
    }

    public BrandDto mapToBrandDto(Brand brand) {
        if (brand == null) return null;
        return BrandDto.builder()
                .id(brand.getId())
                .name(brand.getName())
                .type(brand.getType() != null ? brand.getType().name() : null)
                .build();
    }

    public ProductDto mapToProductDto(Product product) {
        if (product == null) return null;
        return ProductDto.builder()
                .id(product.getId())
                .title(product.getTitle())
                .author(product.getAuthor())
                .category(mapToCategoryDto(product.getCategory()))
                .brand(mapToBrandDto(product.getBrand()))
                .price(product.getPrice())
                .currency(product.getCurrency())
                .coverImageUrl(product.getCoverImageUrl())
                .inStock(product.isInStock())
                .build();
    }
}
