package com.backend.backend.repository.product;

import com.backend.backend.repository.product.entity.ProductImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImageEntity, Integer> {
}
