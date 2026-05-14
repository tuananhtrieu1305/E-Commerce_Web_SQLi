package com.backend.backend.model.order;

public class OrderStatsDTO {
    private Integer userId;
    private Long orderCount;
    private Long totalAmount;

    public OrderStatsDTO(Integer userId, Long orderCount, Long totalAmount) {
        this.userId = userId;
        this.orderCount = orderCount;
        this.totalAmount = totalAmount;
    }

    public Integer getUserId() {
        return userId;
    }

    public Long getOrderCount() {
        return orderCount;
    }

    public Long getTotalAmount() {
        return totalAmount;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public void setOrderCount(Long orderCount) {
        this.orderCount = orderCount;
    }

    public void setTotalAmount(Long totalAmount) {
        this.totalAmount = totalAmount;
    }
}