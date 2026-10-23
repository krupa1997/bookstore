package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.model.*;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.PaymentRepository;
import com.bookstore.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final WalletRepository walletRepository;
    private final CartRepository cartRepository;

    @Transactional
    public PaymentSessionDto initiatePayment(String userId, InitiatePaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to order");
        }

        BigDecimal payAmount = order.getTotalAmount();
        BigDecimal walletDeduction = BigDecimal.ZERO;

        if (request.getWalletRedemptionAmount() != null && request.getWalletRedemptionAmount().compareTo(BigDecimal.ZERO) > 0) {
            Wallet wallet = walletRepository.findByUserId(userId)
                    .orElseThrow(() -> new NoSuchElementException("Wallet not found"));

            if (wallet.getBalance().compareTo(request.getWalletRedemptionAmount()) < 0) {
                throw new IllegalArgumentException("Insufficient wallet balance");
            }

            walletDeduction = request.getWalletRedemptionAmount();
            wallet.setBalance(wallet.getBalance().subtract(walletDeduction));
            walletRepository.save(wallet);

            payAmount = payAmount.subtract(walletDeduction);
            if (payAmount.compareTo(BigDecimal.ZERO) < 0) {
                payAmount = BigDecimal.ZERO;
            }
        }

        // Resolve the existing payment's ID first (scalar query — no entity graph issues),
        // then load it via findById so Hibernate returns the managed L1-cached instance.
        // This guarantees save() issues UPDATE not INSERT, regardless of session state.
        Payment payment = paymentRepository.findIdByOrderId(order.getId())
                .flatMap(paymentRepository::findById)
                .orElseGet(() -> Payment.builder().order(order).build());

        payment.setMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setAmount(payAmount);
        payment.setCurrency("INR");
        payment.setWalletAmountRedeemed(walletDeduction);
        payment.setGatewayRedirectUrl("https://payment-gateway.example.com/checkout?session=" + UUID.randomUUID());
        payment.setGatewayTransactionId(null);

        payment = paymentRepository.save(payment);

        return PaymentSessionDto.builder()
                .paymentId(payment.getId())
                .orderId(order.getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .gatewayRedirectUrl(payment.getGatewayRedirectUrl())
                .paymentStatus(payment.getStatus())
                .build();
    }

    @Transactional
    public PaymentConfirmationDto confirmPayment(String userId, ConfirmPaymentRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new NoSuchElementException("Payment not found: " + request.getPaymentId()));

        Order order = payment.getOrder();
        if (!order.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to order");
        }

        payment.setGatewayTransactionId(request.getGatewayTransactionId());

        if ("SUCCESS".equalsIgnoreCase(request.getStatus())) {
            payment.setStatus(PaymentStatus.PAID);
            order.setStatus(OrderStatus.CONFIRMED);

            // Award 10 gift points for every $10 spent
            int pointsEarned = payment.getAmount().divideToIntegralValue(BigDecimal.TEN).intValue() * 10;
            if (pointsEarned > 0) {
                Wallet wallet = walletRepository.findByUserId(userId).orElse(null);
                if (wallet != null) {
                    wallet.setGiftPoints(wallet.getGiftPoints() + pointsEarned);
                    walletRepository.save(wallet);
                }
            }
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            order.setStatus(OrderStatus.PENDING_PAYMENT);
        }

        paymentRepository.save(payment);
        orderRepository.save(order);

        return PaymentConfirmationDto.builder()
                .paymentId(payment.getId())
                .orderId(order.getId())
                .status(payment.getStatus())
                .transactionTimestamp(LocalDateTime.now())
                .build();
    }

    @Transactional(readOnly = true)
    public WalletBalanceDto getWalletBalance(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> Wallet.builder().balance(BigDecimal.ZERO).giftPoints(0).build());

        return WalletBalanceDto.builder()
                .walletAmount(wallet.getBalance())
                .giftPoints(wallet.getGiftPoints())
                .pointsValueCurrency(wallet.getGiftPointsValue())
                .build();
    }

    @Transactional
    public DiscountSummaryDto redeemGiftPoints(String userId, RedeemPointsRequest request) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Wallet not found"));

        if (wallet.getGiftPoints() < request.getPointsToRedeem()) {
            throw new IllegalArgumentException("Not enough gift points available to redeem");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Cart not found"));

        // 100 points = $1.00 discount
        BigDecimal discount = BigDecimal.valueOf(request.getPointsToRedeem()).divide(BigDecimal.valueOf(100));
        cart.setDiscount(discount);
        cartRepository.save(cart);

        return DiscountSummaryDto.builder()
                .pointsRedeemed(request.getPointsToRedeem())
                .discountAmount(discount)
                .newCartTotal(cart.getTotal())
                .build();
    }
}
