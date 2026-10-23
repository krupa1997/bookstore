package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.model.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final OrderReturnRepository orderReturnRepository;
    private final AuthService authService;
    private final CartService cartService;
    private final CatalogService catalogService;

    @Transactional
    public OrderDto checkout(String userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Active cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout an empty cart");
        }

        Address address = addressRepository.findById(request.getDeliveryAddressId())
                .orElseThrow(() -> new NoSuchElementException("Address not found: " + request.getDeliveryAddressId()));

        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal shippingCost = BigDecimal.valueOf(4.99); // default standard
        if ("express".equalsIgnoreCase(request.getShippingMethodId())) {
            shippingCost = BigDecimal.valueOf(9.99);
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (request.getRedeemGiftPoints() != null && request.getRedeemGiftPoints() > 0) {
            Wallet wallet = walletRepository.findByUserId(userId).orElse(null);
            if (wallet != null && wallet.getGiftPoints() >= request.getRedeemGiftPoints()) {
                // 100 points = $1
                discount = BigDecimal.valueOf(request.getRedeemGiftPoints()).divide(BigDecimal.valueOf(100));
                wallet.setGiftPoints(wallet.getGiftPoints() - request.getRedeemGiftPoints());
                walletRepository.save(wallet);
            }
        }

        BigDecimal total = subtotal.add(shippingCost).subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        LocalDateTime now = LocalDateTime.now();
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING_PAYMENT)
                .deliveryAddress(address)
                .subtotal(subtotal)
                .shippingAmount(shippingCost)
                .discountAmount(discount)
                .totalAmount(total)
                .createdAt(now)
                .canCancelUntil(now.plusHours(48))
                .build();

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .build();
            order.getItems().add(orderItem);
        }

        order = orderRepository.save(order);

        // Clear cart items
        cart.getItems().clear();
        cart.setDiscount(BigDecimal.ZERO);
        cartRepository.save(cart);

        return mapToOrderDto(order);
    }

    @Transactional(readOnly = true)
    public OrderHistoryResponse getOrderHistory(String userId, int page, int limit) {
        PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), limit);
        Page<Order> orderPage = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageRequest);

        List<OrderDto> dtos = orderPage.getContent().stream()
                .map(this::mapToOrderDto)
                .collect(Collectors.toList());

        return OrderHistoryResponse.builder()
                .orders(dtos)
                .total(orderPage.getTotalElements())
                .page(page)
                .build();
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(String userId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to order");
        }

        return mapToOrderDto(order);
    }

    @Transactional
    public OrderDto cancelOrder(String userId, String orderId, CancelOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to order");
        }

        if (!order.isEligibleForCancellation()) {
            throw new IllegalStateException("Order cannot be cancelled. Cancellation window (48 hours) has expired or order is in " + order.getStatus() + " status.");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // If payment was completed, set to refund
        if (order.getPayment() != null && order.getPayment().getStatus() == PaymentStatus.PAID) {
            order.getPayment().setStatus(PaymentStatus.REFUNDED);
        }

        order = orderRepository.save(order);
        return mapToOrderDto(order);
    }

    @Transactional
    public CartDto buyItAgain(String userId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to order");
        }

        Cart cart = cartService.getOrCreateCartEntity(userId, null);

        for (OrderItem item : order.getItems()) {
            AddToCartRequest addRequest = AddToCartRequest.builder()
                    .productId(item.getProduct().getId())
                    .quantity(item.getQuantity())
                    .build();
            cartService.addToCart(userId, null, addRequest);
        }

        return cartService.getCart(userId, null);
    }

    @Transactional
    public ReturnResponseDto requestReturn(String userId, String orderId, ReturnRequestDto request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to order");
        }

        String trackingNumber = "RET-TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        OrderReturn orderReturn = OrderReturn.builder()
                .order(order)
                .status(ReturnStatus.RETURN_REQUESTED)
                .reason(request.getReason())
                .returnShipmentTrackingNumber(trackingNumber)
                .itemIds(request.getItemIds())
                .build();

        orderReturn = orderReturnRepository.save(orderReturn);
        order.setStatus(OrderStatus.RETURNED);
        orderRepository.save(order);

        return ReturnResponseDto.builder()
                .returnId(orderReturn.getId())
                .orderId(order.getId())
                .status(orderReturn.getStatus())
                .returnShipmentTrackingNumber(trackingNumber)
                .build();
    }

    public OrderDto mapToOrderDto(Order order) {
        List<CartItemDto> items = order.getItems().stream()
                .map(item -> CartItemDto.builder()
                        .id(item.getId())
                        .product(catalogService.mapToProductDto(item.getProduct()))
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .status(order.getStatus())
                .items(items)
                .deliveryAddress(authService.mapToAddressDto(order.getDeliveryAddress()))
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .shippingAmount(order.getShippingAmount())
                .totalAmount(order.getTotalAmount())
                .canCancelUntil(order.getCanCancelUntil())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
