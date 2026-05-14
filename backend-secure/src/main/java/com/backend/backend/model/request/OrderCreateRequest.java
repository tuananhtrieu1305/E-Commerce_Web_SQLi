package com.backend.backend.model.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

// ============================================================
// ✅ SECURE: Allow-list Input Validation cho Order Create
// @Pattern trên phone, @Valid cho nested OrderItemRequest
// ============================================================
public class OrderCreateRequest {

    @NotNull(message = "Customer ID is required")
    @Min(value = 1, message = "Customer ID must be positive")
    private Integer customer_id;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\p{L}\\s.,()\\-–&+/'!:#/]*$",
             message = "Address contains invalid characters")
    private String address;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9+\\-()\\s]{7,20}$",
             message = "Phone number format is invalid")
    private String phone;

    @Size(max = 1000, message = "Note must not exceed 1000 characters")
    private String note;

    @NotNull(message = "Order items are required")
    @Size(min = 1, message = "At least one order item is required")
    @Valid
    private List<OrderItemRequest> order_items;

    @Pattern(regexp = "^(COD|BANK)$", message = "Payment method must be COD or BANK")
    private String payment_method;

    // === Getters & Setters ===
    public Integer getCustomer_id() { return customer_id; }
    public void setCustomer_id(Integer customer_id) { this.customer_id = customer_id; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public List<OrderItemRequest> getOrder_items() { return order_items; }
    public void setOrder_items(List<OrderItemRequest> order_items) { this.order_items = order_items; }

    public String getPayment_method() { return payment_method; }
    public void setPayment_method(String payment_method) { this.payment_method = payment_method; }
}
