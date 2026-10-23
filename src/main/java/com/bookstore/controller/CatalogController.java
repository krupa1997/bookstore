package com.bookstore.controller;

import com.bookstore.dto.*;
import com.bookstore.security.UserPrincipal;
import com.bookstore.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalog")
@RequiredArgsConstructor
@Tag(name = "Catalog & Recommendations", description = "Browse categories, brands, products, tentative delivery estimation, and recommendations")
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/categories")
    @Operation(summary = "List all product categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(catalogService.getCategories());
    }

    @GetMapping("/brands")
    @Operation(summary = "Browse brands / publishers / authors")
    public ResponseEntity<List<BrandDto>> getBrands() {
        return ResponseEntity.ok(catalogService.getBrands());
    }

    @GetMapping("/products")
    @Operation(summary = "Browse and search products with filters")
    public ResponseEntity<ProductPaginationDto> getProducts(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(catalogService.getProducts(categoryId, brandId, search, page, limit));
    }

    @GetMapping("/products/{productId}")
    @Operation(summary = "Get product details with tentative delivery date")
    public ResponseEntity<ProductDetailDto> getProductById(
            @PathVariable String productId,
            @RequestParam(required = false) String postalCode) {
        return ResponseEntity.ok(catalogService.getProductById(productId, postalCode));
    }

    @GetMapping("/products/{productId}/related")
    @Operation(summary = "Get related products (upsell & cross-sell)")
    public ResponseEntity<List<ProductDto>> getRelatedProducts(
            @PathVariable String productId,
            @RequestParam(defaultValue = "all") String type) {
        return ResponseEntity.ok(catalogService.getRelatedProducts(productId, type));
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get personalized recommendations based on order history", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<ProductDto>> getRecommendations(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(catalogService.getRecommendations(userId));
    }
}
