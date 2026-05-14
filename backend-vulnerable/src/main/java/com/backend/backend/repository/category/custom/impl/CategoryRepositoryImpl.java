package com.backend.backend.repository.category.custom.impl;

import com.backend.backend.model.category.CategoryProductResponseDTO;
import com.backend.backend.model.category.ProductSummaryDTO;
import com.backend.backend.repository.category.custom.CategoryRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class CategoryRepositoryImpl implements CategoryRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    public static void joinTable(StringBuilder sql) {
        sql.append("SELECT c.id as category_id, c.cate_name, " +
                "p.id as product_id, p.title as product_name, p.stock " +
                "FROM categories c " +
                "LEFT JOIN products p ON c.id = p.cate_id " );
    }

    @Override
    public List<CategoryProductResponseDTO> getCategoriesWithProducts() {
        StringBuilder sql = new StringBuilder();
        joinTable(sql);
        sql.append(" ORDER BY c.id ASC, p.id ASC");

        Query query = entityManager.createNativeQuery(sql.toString());
        List<Object[]> results = query.getResultList();

        Map<Integer, CategoryProductResponseDTO> categoryMap = new LinkedHashMap<>();

        for(Object[] row : results) {
            Integer categoryId = (Integer) row[0];
            String categoryName = (String) row[1];
            Integer productId = (Integer) row[2];

            CategoryProductResponseDTO categoryDTO = categoryMap.get(categoryId);
            if(categoryDTO == null) {
                categoryDTO = new CategoryProductResponseDTO();
                categoryDTO.setCategory_name(categoryName);
                categoryDTO.setProducts(new ArrayList<>());
                categoryMap.put(categoryId, categoryDTO);
            }

            if(productId != null) {
                ProductSummaryDTO productSummary = new ProductSummaryDTO();
                productSummary.setProduct_id(productId);
                productSummary.setProduct_name((String) row[3]);
                productSummary.setStock((Integer) row[4]);

                categoryDTO.getProducts().add(productSummary);
            }
        }

        return new ArrayList<>(categoryMap.values());
    }
}
