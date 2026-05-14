package com.backend.backend.repository.product;

import com.backend.backend.repository.product.entity.SellerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SellerRepository extends JpaRepository<SellerEntity, Integer> {
    @Query("SELECT COUNT(s) > 0 FROM SellerEntity s WHERE s.seller_name = :sellerName")
    boolean existsBySellerName(@Param("sellerName") String sellerName);

    @Query("SELECT s FROM SellerEntity s WHERE s.seller_name = :sellerName")
    SellerEntity findBySellerName(@Param("sellerName") String sellerName);
}
