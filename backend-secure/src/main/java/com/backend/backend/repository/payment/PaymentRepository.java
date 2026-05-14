package com.backend.backend.repository.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.backend.repository.payment.entity.PaymentEntity;


public interface PaymentRepository extends JpaRepository<PaymentEntity, Integer> {
    PaymentEntity findByOrder_Id(Integer orderId);
}
