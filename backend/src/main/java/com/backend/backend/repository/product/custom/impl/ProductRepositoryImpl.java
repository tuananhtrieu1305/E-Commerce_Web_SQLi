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

import java.lang.reflect.Field;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ProductRepositoryImpl implements ProductRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;

    public static void joinTable(ProductSearchBuilder productSearchBuilder, StringBuilder sql) {
        sql.append("SELECT p.id, p.title, p.product_info, p.price, p.stock, p.created_at, p.updated_at, " +
                        "c.id as category_id, c.cate_name, s.id as seller_id, s.seller_name, s.seller_info, " +
                        "pi.id as image_id, pi.image_path FROM products p " +
                        "LEFT JOIN categories c ON p.cate_id = c.id " +
                        "LEFT JOIN sellers s ON p.seller_id = s.id " +
                        "LEFT JOIN product_images pi ON p.id = pi.prod_id ");
    }

    public static void query(ProductSearchBuilder productSearchBuilder, StringBuilder where) {
        try {
            Field[] fields = productSearchBuilder.getClass().getDeclaredFields();
            for(Field item : fields) {
                item.setAccessible(true);
                String fieldName = item.getName();
                Object fieldValue = item.get(productSearchBuilder);
                if (fieldValue == null) {
                    continue;
                }
                String value = item.get(productSearchBuilder).toString();

                if(fieldName.equals("id")) {
                    where.append("AND p.").append(fieldName).append(" = ").append(value).append(" ");
                    continue;
                }

                if(fieldName.equals("title") || fieldName.equals("productInfo")) {
                    where.append("AND p.").append(fieldName).append(" LIKE '%").append(value).append("%' ");
                    continue;
                }

                if(fieldName.equals("categoryName")) {
                    where.append("AND c.cate_name LIKE '%").append(value).append("%' ");
                    continue;
                }

                if(fieldName.equals("sellerName")) {
                    where.append("AND s.seller_name LIKE '%").append(value).append("%' ");
                    continue;
                }

                if(fieldName.equals("minPrice")) {
                    where.append("AND p.price >= ").append(value).append(" ");
                    continue;
                }

                if(fieldName.equals("maxPrice")) {
                    where.append("AND p.price <= ").append(value).append(" ");
                    continue;
                }

                if(fieldName.equals("minStock")) {
                    where.append("AND p.stock >= ").append(value).append(" ");
                    continue;
                }

                if(fieldName.equals("maxStock")) {
                    where.append("AND p.stock <= ").append(value).append(" ");
                    continue;
                }

                if(fieldName.equals("startTime")) {
                    where.append("AND DATE(p.created_at) >= '").append(value).append("' ");
                    continue;
                }

                if(fieldName.equals("endTime")) {
                    where.append("AND DATE(p.created_at) <= '").append(value).append("' ");
                }
            }
        } catch(Exception ex) {
            ex.printStackTrace();
        }
    }

    @Override
    public List<ProductDTO> getProduct(ProductSearchBuilder productSearchBuilder) {
        StringBuilder sql = new StringBuilder();
        joinTable(productSearchBuilder, sql);
        StringBuilder where = new StringBuilder("WHERE p.deleted = false ");
        query(productSearchBuilder, where);
        sql.append(where);
        sql.append(" ORDER BY p.created_at DESC, p.id ASC, pi.id ASC");

        Query query = entityManager.createNativeQuery(sql.toString());
        List<Object[]> results = query.getResultList();

        Map<Integer, ProductDTO> productMap = new LinkedHashMap<>();

        for(Object[] row : results) {
            Integer productId = (Integer) row[0];
            ProductDTO product = productMap.get(productId);

            if(product == null) {
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
