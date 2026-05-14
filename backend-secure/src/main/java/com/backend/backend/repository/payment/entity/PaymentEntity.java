package com.backend.backend.repository.payment.entity;

import com.backend.backend.repository.order.entity.OrderEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class PaymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", referencedColumnName = "id")
    private OrderEntity order;

    @Column(name = "method")
    private String method;

    @Column(name = "status")
    private String status;

    @Column(name = "transaction_id")
    private String transaction_id;

    @Column(name = "paid_at")
    private LocalDateTime paid_at;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public OrderEntity getOrder() {
        return order;
    }

    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransaction_id() {
        return transaction_id;
    }

    public void setTransaction_id(String transaction_id) {
        this.transaction_id = transaction_id;
    }

    public LocalDateTime getPaid_at() {
        return paid_at;
    }

    public void setPaid_at(LocalDateTime paid_at) {
        this.paid_at = paid_at;
    }
}
