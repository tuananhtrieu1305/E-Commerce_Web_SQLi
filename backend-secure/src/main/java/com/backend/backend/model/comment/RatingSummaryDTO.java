package com.backend.backend.model.comment;

public class RatingSummaryDTO {

    private Integer productId;
    private Double avgStar;
    private Long totalReviews;

    public RatingSummaryDTO() {}

    public RatingSummaryDTO(Integer productId, Double avgStar, Long totalReviews) {
        this.productId = productId;
        this.avgStar = avgStar;
        this.totalReviews = totalReviews;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Double getAvgStar() {
        return avgStar;
    }

    public void setAvgStar(Double avgStar) {
        this.avgStar = avgStar;
    }

    public Long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Long totalReviews) {
        this.totalReviews = totalReviews;
    }
}
