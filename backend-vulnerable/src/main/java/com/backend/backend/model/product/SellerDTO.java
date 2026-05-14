package com.backend.backend.model.product;

public class SellerDTO {
    private Integer id;
    private String seller_name;
    private String seller_info;

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
}
