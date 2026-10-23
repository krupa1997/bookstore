package com.bookstore.repository;

import com.bookstore.model.OrderReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderReturnRepository extends JpaRepository<OrderReturn, String> {
    List<OrderReturn> findByOrderId(String orderId);
}
