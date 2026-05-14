package com.backend.backend.repository.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.backend.model.product.BestRatedIdOnly;
import com.backend.backend.model.product.BestSellerIdOnly;
import com.backend.backend.repository.product.entity.ProductEntity;

public interface ProductRepository extends JpaRepository<ProductEntity, Integer>, JpaSpecificationExecutor<ProductEntity> {
    boolean existsByTitleAndDeletedFalse(String title);

    @Query(value = "SELECT * FROM products p WHERE p.title = :title LIMIT 1", nativeQuery = true)
    Optional<ProductEntity> findByTitleIncludeDeleted(@Param("title") String title);

    @Query(value = """
        SELECT 
            p.id AS productId
        FROM products p
        JOIN order_items oi ON oi.prod_id = p.id
        JOIN orders o ON o.id = oi.order_id
        WHERE p.deleted = 0 
          AND o.deleted = 0
        GROUP BY p.id
        ORDER BY COUNT(DISTINCT o.user_id) DESC
        """,
        nativeQuery = true)
    List<BestSellerIdOnly> findBestSellerIds();

    @Query(value = """
        SELECT 
            p.id AS productId
        FROM products p
        JOIN comments c ON c.prod_id = p.id
        WHERE p.deleted = 0
        GROUP BY p.id
        HAVING COUNT(*) > 0
        ORDER BY AVG(c.star) DESC, COUNT(*) DESC
        """,
        nativeQuery = true)
    List<BestRatedIdOnly> findBestRatedIds();


}
