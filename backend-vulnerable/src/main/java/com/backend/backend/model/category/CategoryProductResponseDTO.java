package com.backend.backend.model.category;

import java.util.List;

public class CategoryProductResponseDTO {
    private String category_name;
    private List<ProductSummaryDTO> products;

    public String getCategory_name() {
        return category_name;
    }

    public void setCategory_name(String category_name) {
        this.category_name = category_name;
    }

    public List<ProductSummaryDTO> getProducts() {
        return products;
    }

    public void setProducts(List<ProductSummaryDTO> products) {
        this.products = products;
    }
}
