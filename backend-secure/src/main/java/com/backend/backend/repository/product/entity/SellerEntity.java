package com.backend.backend.repository.product.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "v_sellers")
public class SellerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "seller_name")
    private String seller_name;

    @Column(name = "seller_info")
    private String seller_info;

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductEntity> product;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSeller_name() {
        return seller_name;
    }

    public void setSeller_name(String seller_name) {
        this.seller_name = seller_name;
    }

    public String getSeller_info() {
        return seller_info;
    }

    public void setSeller_info(String seller_info) {
        this.seller_info = seller_info;
    }

    public List<ProductEntity> getProduct() {
        return product;
    }

    public void setProduct(List<ProductEntity> product) {
        this.product = product;
    }
}
