package com.backend.backend.builder.product;

import java.util.List;

public class ProductSearchBuilder {
    private Integer id;
    private String title;
    private String productInfo;
    private Integer minPrice;
    private Integer maxPrice;
    private String categoryName;
    private String sellerName;
    private String startTime;
    private String endTime;
    private Integer minStock;
    private Integer maxStock;
    private Integer price;
    private Integer stock;
    private List<String> images;

    private ProductSearchBuilder(ProductSearchBuilder.Builder builder) {
        this.id = builder.id;
        this.title = builder.title;
        this.productInfo = builder.productInfo;
        this.maxPrice = builder.maxPrice;
        this.minPrice = builder.minPrice;
        this.startTime = builder.startTime;
        this.endTime = builder.endTime;
        this.categoryName = builder.categoryName;
        this.sellerName = builder.sellerName;
        this.minStock = builder.minStock;
        this.maxStock = builder.maxStock;
        this.price = builder.price;
        this.stock = builder.stock;
        this.images = builder.images;
    }

    public Integer getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getProductInfo() {
        return productInfo;
    }

    public Integer getMinPrice() {
        return minPrice;
    }

    public Integer getMaxPrice() {
        return maxPrice;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getSellerName() {
        return sellerName;
    }

    public String getStartTime() {
        return startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public Integer getMinStock() {
        return minStock;
    }

    public Integer getMaxStock() {
        return maxStock;
    }

    public Integer getPrice() {
        return price;
    }

    public Integer getStock() {
        return stock;
    }

    public List<String> getImages() {
        return images;
    }

    public static class Builder {
        private Integer id;
        private String title;
        private String productInfo;
        private Integer minPrice;
        private Integer maxPrice;
        private String categoryName;
        private String sellerName;
        private String startTime;
        private String endTime;
        private Integer minStock;
        private Integer maxStock;
        private Integer price;
        private Integer stock;
        private List<String> images;

        public Builder setId(Integer id) {
            this.id = id;
            return this;
        }

        public Builder setTitle(String title) {
            this.title = title;
            return this;
        }

        public Builder setProductInfo(String productInfo) {
            this.productInfo = productInfo;
            return this;
        }

        public Builder setMinPrice(Integer minPrice) {
            this.minPrice = minPrice;
            return this;
        }

        public Builder setMaxPrice(Integer maxPrice) {
            this.maxPrice = maxPrice;
            return this;
        }

        public Builder setCategoryName(String categoryName) {
            this.categoryName = categoryName;
            return this;
        }

        public Builder setSellerName(String sellerName) {
            this.sellerName = sellerName;
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

        public Builder setMinStock(Integer minStock) {
            this.minStock = minStock;
            return this;
        }

        public Builder setMaxStock(Integer maxStock) {
            this.maxStock = maxStock;
            return this;
        }

        public Builder setPrice(Integer price) {
            this.price = price;
            return this;
        }

        public Builder setStock(Integer stock) {
            this.stock = stock;
            return this;
        }

        public Builder setImages(List<String> images) {
            this.images = images;
            return this;
        }

        public ProductSearchBuilder build() {
            return new ProductSearchBuilder(this);
        }
    }
}
