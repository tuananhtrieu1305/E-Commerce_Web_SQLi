package com.backend.backend.repository.product.custom.impl;

import com.backend.backend.builder.product.ProductSearchBuilder;
import com.backend.backend.model.product.CategoryDTO;
import com.backend.backend.model.product.ProductDTO;
import com.backend.backend.model.product.ProductImageDTO;
import com.backend.backend.model.product.SellerDTO;
import com.backend.backend.repository.product.custom.ProductRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import java.sql.Timestamp;
import java.util.*;

// ============================================================
// ✅ SECURE: Parameterized Queries — chống SQL Injection
// Tất cả user input được truyền qua setParameter(), KHÔNG concat chuỗi
// ============================================================
public class ProductRepositoryImpl implements ProductRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<ProductDTO> getProduct(ProductSearchBuilder builder) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT p.id, p.title, p.product_info, p.price, p.stock, p.created_at, p.updated_at, "
                + "c.id as category_id, c.cate_name, s.id as seller_id, s.seller_name, s.seller_info, "
                + "pi.id as image_id, pi.image_path FROM products p "
                + "LEFT JOIN categories c ON p.cate_id = c.id "
                + "LEFT JOIN sellers s ON p.seller_id = s.id "
                + "LEFT JOIN product_images pi ON p.id = pi.prod_id ");

        StringBuilder where = new StringBuilder("WHERE p.deleted = false ");
        Map<String, Object> paramMap = new LinkedHashMap<>();

        // ✅ Parameterized: user input → :param placeholder → setParameter()
        if (builder.getId() != null) {
            where.append("AND p.id = :id ");
            paramMap.put("id", builder.getId());
        }
        if (builder.getTitle() != null && !builder.getTitle().isEmpty()) {
            where.append("AND p.title LIKE :title ");
            paramMap.put("title", "%" + builder.getTitle() + "%");
        }
        if (builder.getProductInfo() != null && !builder.getProductInfo().isEmpty()) {
            where.append("AND p.product_info LIKE :productInfo ");
            paramMap.put("productInfo", "%" + builder.getProductInfo() + "%");
        }
        if (builder.getCategoryName() != null && !builder.getCategoryName().isEmpty()) {
            where.append("AND c.cate_name LIKE :categoryName ");
            paramMap.put("categoryName", "%" + builder.getCategoryName() + "%");
        }
        if (builder.getSellerName() != null && !builder.getSellerName().isEmpty()) {
            where.append("AND s.seller_name LIKE :sellerName ");
            paramMap.put("sellerName", "%" + builder.getSellerName() + "%");
        }
        if (builder.getMinPrice() != null) {
            where.append("AND p.price >= :minPrice ");
            paramMap.put("minPrice", builder.getMinPrice());
        }
        if (builder.getMaxPrice() != null) {
            where.append("AND p.price <= :maxPrice ");
            paramMap.put("maxPrice", builder.getMaxPrice());
        }
        if (builder.getMinStock() != null) {
            where.append("AND p.stock >= :minStock ");
            paramMap.put("minStock", builder.getMinStock());
        }
        if (builder.getMaxStock() != null) {
            where.append("AND p.stock <= :maxStock ");
            paramMap.put("maxStock", builder.getMaxStock());
        }
        if (builder.getStartTime() != null && !builder.getStartTime().isEmpty()) {
            where.append("AND DATE(p.created_at) >= :startTime ");
            paramMap.put("startTime", builder.getStartTime());
        }
        if (builder.getEndTime() != null && !builder.getEndTime().isEmpty()) {
            where.append("AND DATE(p.created_at) <= :endTime ");
            paramMap.put("endTime", builder.getEndTime());
        }

        sql.append(where);
        sql.append(" ORDER BY p.created_at DESC, p.id ASC, pi.id ASC");

        Query query = entityManager.createNativeQuery(sql.toString());

        // ✅ Bind tất cả parameter an toàn
        paramMap.forEach(query::setParameter);

        List<Object[]> results = query.getResultList();

        Map<Integer, ProductDTO> productMap = new LinkedHashMap<>();

        for (Object[] row : results) {
            Integer productId = (Integer) row[0];
            ProductDTO product = productMap.get(productId);

            if (product == null) {
                product = new ProductDTO();
                product.setId(productId);
                product.setTitle((String) row[1]);
                product.setProductInfo((String) row[2]);
                product.setPrice((Integer) row[3]);
                product.setStock((Integer) row[4]);
                product.setCreatedAt(row[5] != null ? ((Timestamp) row[5]).toLocalDateTime() : null);
                product.setUpdatedAt(row[6] != null ? ((Timestamp) row[6]).toLocalDateTime() : null);

                CategoryDTO category = new CategoryDTO();
                category.setId((Integer) row[7]);
                category.setCate_name((String) row[8]);
                product.setCategory(category);

                SellerDTO seller = new SellerDTO();
                seller.setId((Integer) row[9]);
                seller.setSeller_name((String) row[10]);
                seller.setSeller_info((String) row[11]);
                product.setSeller(seller);

                product.setImagePaths(new ArrayList<>());

                productMap.put(productId, product);
            }

            if (row[12] != null && row[13] != null) {
                Integer imageId = (Integer) row[12];
                String imagePath = (String) row[13];

                boolean imageExists = product.getImagePaths().stream()
                        .anyMatch(image -> image.getId().equals(imageId));

                if (!imageExists) {
                    ProductImageDTO imageDTO = new ProductImageDTO();
                    imageDTO.setId(imageId);
                    imageDTO.setImage_path(imagePath);
                    product.getImagePaths().add(imageDTO);
                }
            }
        }

        return new ArrayList<>(productMap.values());
    }
}
