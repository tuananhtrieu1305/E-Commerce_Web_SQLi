package com.backend.backend.repository.order.entity;

import com.backend.backend.repository.product.entity.ProductEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "prod_id", nullable = false)
    private ProductEntity product;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(name = "item_quantity")
    private Integer item_quantity;

    @Column(name = "item_price")
    private Integer item_price;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ProductEntity getProduct() {
        return product;
    }

    public void setProduct(ProductEntity product) {
        this.product = product;
    }

    public OrderEntity getOrder() {
        return order;
    }

    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    public Integer getItem_quantity() {
        return item_quantity;
    }

    public void setItem_quantity(Integer item_quantity) {
        this.item_quantity = item_quantity;
    }

    public Integer getItem_price() {
        return item_price;
    }

    public void setItem_price(Integer item_price) {
        this.item_price = item_price;
    }
}
