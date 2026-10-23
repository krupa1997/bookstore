package com.bookstore.repository;

import com.bookstore.model.Payment;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    @Query("SELECT p FROM Payment p WHERE p.order.id = :orderId")
    Optional<Payment> findByOrderId(@Param("orderId") String orderId);

    @Query("SELECT p.id FROM Payment p WHERE p.order.id = :orderId")
    Optional<String> findIdByOrderId(@Param("orderId") String orderId);
}
