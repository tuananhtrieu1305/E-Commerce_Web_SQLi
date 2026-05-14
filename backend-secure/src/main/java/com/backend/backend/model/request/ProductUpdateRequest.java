package com.backend.backend.model.request;

import jakarta.validation.constraints.*;
import java.util.List;

// ============================================================
// ✅ SECURE: Allow-list Input Validation cho Update
// Tất cả field đều optional nhưng nếu có phải pass regex
// ============================================================
public class ProductUpdateRequest {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\p{L}\\s.,()\\-–&+/'!:]+$",
             message = "Title contains invalid characters")
    private String title;

    @Size(max = 5000, message = "Product info must not exceed 5000 characters")
    private String product_info;

    @Min(value = 0, message = "Price must be >= 0")
    private Integer price;

    @Min(value = 0, message = "Stock must be >= 0")
    private Integer stock;

    @Pattern(regexp = "^[a-zA-Z0-9\\p{L}\\s.,()\\-–&+/'!:]*$",
             message = "Category name contains invalid characters")
    private String cate_name;

    @Pattern(regexp = "^[a-zA-Z0-9\\p{L}\\s.,()\\-–&+/'!:]*$",
             message = "Seller name contains invalid characters")
    private String seller_name;

    private List<String> images;

    // === Getters & Setters ===
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProduct_info() { return product_info; }
    public void setProduct_info(String product_info) { this.product_info = product_info; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getCate_name() { return cate_name; }
    public void setCate_name(String cate_name) { this.cate_name = cate_name; }

    public String getSeller_name() { return seller_name; }
    public void setSeller_name(String seller_name) { this.seller_name = seller_name; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
