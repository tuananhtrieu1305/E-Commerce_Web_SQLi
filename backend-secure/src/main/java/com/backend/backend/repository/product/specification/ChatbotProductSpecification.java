package com.backend.backend.repository.product.specification;

import com.backend.backend.repository.product.entity.ProductEntity;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ChatbotProductSpecification {

    public static Specification<ProductEntity> findByAiCriteria(Map<String, Object> aiParams) {
        return (root, query, cb) -> {
            root.fetch("category", JoinType.LEFT);
            root.fetch("seller", JoinType.LEFT);
            root.fetch("images", JoinType.LEFT);
            query.distinct(true);

            List<Predicate> mainPredicates = new ArrayList<>();
            mainPredicates.add(cb.isFalse(root.get("deleted")));

            if (aiParams.containsKey("minPrice")) {
                mainPredicates.add(cb.greaterThanOrEqualTo(root.get("price"), (Integer) aiParams.get("minPrice")));
            }
            if (aiParams.containsKey("maxPrice")) {
                mainPredicates.add(cb.lessThanOrEqualTo(root.get("price"), (Integer) aiParams.get("maxPrice")));
            }

            if (aiParams.containsKey("sellerName")) {
                mainPredicates.add(cb.like(root.join("seller", JoinType.LEFT).get("seller_name"), "%" + (String) aiParams.get("sellerName") + "%"));
            }

            if (aiParams.containsKey("keywords")) {
                String keywords = (String) aiParams.get("keywords");

                Predicate titleMatch = cb.like(root.get("title"), "%" + keywords + "%");
                Predicate infoMatch = cb.like(root.get("product_info"), "%" + keywords + "%");
                Predicate categoryMatch = cb.like(root.join("category", JoinType.LEFT).get("cate_name"), "%" + keywords + "%");

                mainPredicates.add(cb.or(titleMatch, infoMatch, categoryMatch));
            }

            query.orderBy(cb.desc(root.get("created_at")));

            return cb.and(mainPredicates.toArray(new Predicate[0]));
        };
    }
}