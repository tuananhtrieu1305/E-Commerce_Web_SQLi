package com.backend.backend.repository.category;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.backend.model.product.CategoryDTO;
import com.backend.backend.repository.category.entity.CategoryEntity;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer> {
    @Query("SELECT COUNT(c) > 0 FROM CategoryEntity c WHERE c.cate_name = :cateName")
    boolean existsByCateName(@Param("cateName") String cateName);

    @Query("SELECT c FROM CategoryEntity c WHERE c.cate_name = :cateName")
    CategoryEntity findByCateName(@Param("cateName") String cateName);

    @Query("SELECT DISTINCT c FROM CategoryEntity c LEFT JOIN FETCH c.product")
    List<CategoryEntity> findAllWithProducts();

    @Query("SELECT new com.backend.backend.model.product.CategoryDTO(c.id, c.cate_name) FROM CategoryEntity c")
    List<CategoryDTO> findAllCategoryOnly();
}
