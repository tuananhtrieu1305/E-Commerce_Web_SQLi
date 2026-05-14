package com.backend.backend.repository.order.specification;

import com.backend.backend.builder.order.OrderSearchBuilder;
import com.backend.backend.repository.order.entity.OrderEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {

    public static Specification<OrderEntity> findByCriteria(OrderSearchBuilder criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.isFalse(root.get("deleted")));

            if (criteria.getId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("id"), criteria.getId()));
            }
            if (StringUtils.hasText(criteria.getCustomer_name())) {
                predicates.add(criteriaBuilder.like(root.join("user").get("fullname"), "%" + criteria.getCustomer_name() + "%"));
            }
            if (StringUtils.hasText(criteria.getAddress())) {
                predicates.add(criteriaBuilder.like(root.get("address"), "%" + criteria.getAddress() + "%"));
            }
            if (StringUtils.hasText(criteria.getPhone())) {
                predicates.add(criteriaBuilder.like(root.get("phone"), "%" + criteria.getPhone() + "%"));
            }
            if (criteria.getMin_cost() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("total_cost"), criteria.getMin_cost()));
            }
            if (criteria.getMax_cost() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("total_cost"), criteria.getMax_cost()));
            }
            if (StringUtils.hasText(criteria.getStartTime())) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("created_at"), java.time.LocalDate.parse(criteria.getStartTime()).atStartOfDay()));
            }
            if (StringUtils.hasText(criteria.getEndTime())) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("created_at"), java.time.LocalDate.parse(criteria.getEndTime()).atTime(23, 59, 59)));
            }
            if (StringUtils.hasText(criteria.getPayment_status())) {
                predicates.add(criteriaBuilder.equal(root.join("payment").get("status"), criteria.getPayment_status()));
            }

            query.orderBy(criteriaBuilder.desc(root.get("created_at")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
