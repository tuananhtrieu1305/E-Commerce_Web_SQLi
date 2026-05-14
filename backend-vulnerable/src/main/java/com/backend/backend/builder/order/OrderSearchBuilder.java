package com.backend.backend.builder.order;

import java.util.List;

public class OrderSearchBuilder {
    private Integer id;
    private Integer customer_id;
    private String customer_name;
    private String address;
    private String phone;
    private String startTime;
    private String endTime;
    private Integer min_cost;
    private Integer max_cost;
    private String note;
    private List<OrderItemSearchBuilder> order_items;
    private String payment_status;

    private String paymentMethod;

    private OrderSearchBuilder(Builder builder) {
        this.id = builder.id;
        this.customer_id = builder.customer_id;
        this.customer_name = builder.customer_name;
        this.address = builder.address;
        this.phone = builder.phone;
        this.startTime = builder.startTime;
        this.endTime = builder.endTime;
        this.min_cost = builder.min_cost;
        this.max_cost = builder.max_cost;
        this.note = builder.note;
        this.order_items = builder.order_items;
        this.payment_status = builder.payment_status;
        this.paymentMethod = builder.paymentMethod;
    }

    public Integer getId() {
        return id;
    }

    public String getCustomer_name() {
        return customer_name;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }

    public String getStartTime() {
        return startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public Integer getMin_cost() {
        return min_cost;
    }

    public Integer getMax_cost() {
        return max_cost;
    }

    public Integer getCustomer_id() {
        return customer_id;
    }

    public String getNote() {
        return note;
    }

    public List<OrderItemSearchBuilder> getOrder_items() {
        return order_items;
    }

    public String getPayment_status() {
        return payment_status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public static class Builder {
        private Integer id;
        private Integer customer_id;
        private String customer_name;
        private String address;
        private String phone;
        private String startTime;
        private String endTime;
        private Integer min_cost;
        private Integer max_cost;
        private String note;
        private List<OrderItemSearchBuilder> order_items;
        private String payment_status;
        private String paymentMethod;

        public Builder setId(Integer id) {
            this.id = id;
            return this;
        }

        public Builder setCustomer_name(String customer_name) {
            this.customer_name = customer_name;
            return this;
        }

        public Builder setAddress(String address) {
            this.address = address;
            return this;
        }

        public Builder setPhone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder setStartTime(String startTime) {
            this.startTime = startTime;
            return this;
        }

        public Builder setEndTime(String endTime) {
            this.endTime = endTime;
            return this;
        }

        public Builder setMin_cost(Integer min_cost) {
            this.min_cost = min_cost;
            return this;
        }

        public Builder setMax_cost(Integer max_cost) {
            this.max_cost = max_cost;
            return this;
        }

        public Builder setCustomer_id(Integer customer_id) {
            this.customer_id = customer_id;
            return this;
        }

        public Builder setNote(String note) {
            this.note = note;
            return this;
        }

        public Builder setOrder_items(List<OrderItemSearchBuilder> order_items) {
            this.order_items = order_items;
            return this;
        }

        public Builder setPayment_status(String payment_status) {
            this.payment_status = payment_status;
            return this;
        }
        public Builder setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public OrderSearchBuilder build() {
            return new OrderSearchBuilder(this);
        }
    }
}
