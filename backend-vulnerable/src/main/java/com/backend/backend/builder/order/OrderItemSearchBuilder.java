package com.backend.backend.builder.order;

public class OrderItemSearchBuilder {
    private Integer prod_id;
    private Integer quantity;

    private OrderItemSearchBuilder(Builder builder) {
        this.prod_id = builder.prod_id;
        this.quantity = builder.quantity;
    }

    public Integer getProd_id() {
        return prod_id;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public static class Builder {
        private Integer prod_id;
        private Integer quantity;

        public Builder setProd_id(Integer prod_id) {
            this.prod_id = prod_id;
            return this;
        }

        public Builder setQuantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public OrderItemSearchBuilder build() {
            return new OrderItemSearchBuilder(this);
        }
    }
}
