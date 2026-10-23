package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.model.*;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CatalogService catalogService;

    @Transactional
    public Cart getOrCreateCartEntity(String userId, String guestToken) {
        if (userId != null) {
            // Return existing user cart if present
            Optional<Cart> userCart = cartRepository.findByUserId(userId);
            if (userCart.isPresent()) {
                return userCart.get();
            }
            // No user cart yet — migrate guest cart if one exists, otherwise create fresh
            if (guestToken != null && !guestToken.isBlank()) {
                Optional<Cart> guestCart = cartRepository.findByGuestToken(guestToken);
                if (guestCart.isPresent()) {
                    Cart cart = guestCart.get();
                    cart.setUserId(userId);
                    cart.setGuestToken(null);
                    return cartRepository.save(cart);
                }
            }
            return cartRepository.save(Cart.builder().userId(userId).build());
        }

        String effectiveGuestToken = (guestToken != null && !guestToken.isBlank()) ? guestToken : UUID.randomUUID().toString();
        return cartRepository.findByGuestToken(effectiveGuestToken)
                .orElseGet(() -> cartRepository.save(Cart.builder().guestToken(effectiveGuestToken).build()));
    }

    @Transactional(readOnly = true)
    public CartDto getCart(String userId, String guestToken) {
        Cart cart = getOrCreateCartEntity(userId, guestToken);
        return mapToCartDto(cart);
    }

    @Transactional
    public CartDto addToCart(String userId, String guestToken, AddToCartRequest request) {
        Cart cart = getOrCreateCartEntity(userId, guestToken);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NoSuchElementException("Product not found: " + request.getProductId()));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        return mapToCartDto(cart);
    }

    @Transactional
    public CartDto updateCartItem(String userId, String guestToken, String itemId, int quantity) {
        Cart cart = getOrCreateCartEntity(userId, guestToken);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Cart item not found: " + itemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        cart = cartRepository.save(cart);
        return mapToCartDto(cart);
    }

    @Transactional
    public CartDto removeCartItem(String userId, String guestToken, String itemId) {
        Cart cart = getOrCreateCartEntity(userId, guestToken);
        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        cart = cartRepository.save(cart);
        return mapToCartDto(cart);
    }

    public CartDto mapToCartDto(Cart cart) {
        List<CartItemDto> itemDtos = cart.getItems().stream()
                .map(this::mapToCartItemDto)
                .collect(Collectors.toList());

        return CartDto.builder()
                .cartId(cart.getId())
                .items(itemDtos)
                .subtotal(cart.getSubtotal())
                .discount(cart.getDiscount() != null ? cart.getDiscount() : BigDecimal.ZERO)
                .total(cart.getTotal())
                .build();
    }

    public CartItemDto mapToCartItemDto(CartItem item) {
        return CartItemDto.builder()
                .id(item.getId())
                .product(catalogService.mapToProductDto(item.getProduct()))
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
