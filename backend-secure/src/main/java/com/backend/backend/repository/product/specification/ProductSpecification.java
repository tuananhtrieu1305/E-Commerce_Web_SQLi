package com.backend.backend.repository.product.specification;

import com.backend.backend.builder.product.ProductSearchBuilder;
import com.backend.backend.repository.product.entity.ProductEntity;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {
    public static Specification<ProductEntity> findByCriteria(ProductSearchBuilder criteria) {
        return (root, query, cb) -> {
            root.fetch("category", JoinType.LEFT);
            root.fetch("seller", JoinType.LEFT);
            root.fetch("images", JoinType.LEFT);
            query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("deleted")));

            if (criteria.getId() != null) {
                predicates.add(cb.equal(root.get("id"), criteria.getId()));
            }
            if (StringUtils.hasText(criteria.getTitle())) {
                predicates.add(cb.like(root.get("title"), "%" + criteria.getTitle() + "%"));
            }
            if (StringUtils.hasText(criteria.getProductInfo())) {
                predicates.add(cb.like(root.get("product_info"), "%" + criteria.getProductInfo() + "%"));
            }
            if (StringUtils.hasText(criteria.getCategoryName())) {
                predicates.add(cb.like(root.join("category").get("cate_name"), "%" + criteria.getCategoryName() + "%"));
            }
            if (StringUtils.hasText(criteria.getSellerName())) {
                predicates.add(cb.like(root.join("seller").get("seller_name"), "%" + criteria.getSellerName() + "%"));
            }
            if (criteria.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), criteria.getMinPrice()));
            }
            if (criteria.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), criteria.getMaxPrice()));
            }
            if (criteria.getMinStock() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("stock"), criteria.getMinStock()));
            }
            if (criteria.getMaxStock() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("stock"), criteria.getMaxStock()));
            }

            query.orderBy(cb.desc(root.get("created_at")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}