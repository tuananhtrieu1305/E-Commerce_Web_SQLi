package com.backend.backend.model.request;

import jakarta.validation.constraints.*;

// ============================================================
// ✅ SECURE: Allow-list Input Validation cho Order Item
// ============================================================
public class OrderItemRequest {

    @NotNull(message = "Product ID is required")
    @Min(value = 1, message = "Product ID must be positive")
    private Integer prod_id;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    // === Getters & Setters ===
    public Integer getProd_id() { return prod_id; }
    public void setProd_id(Integer prod_id) { this.prod_id = prod_id; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
