package com.backend.backend.repository.account.specification;

import com.backend.backend.builder.account.AccountSearchBuilder;
import com.backend.backend.repository.account.entity.AccountEntity;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import java.util.ArrayList;
import java.util.List;

public class AccountSpecification {

    public static Specification<AccountEntity> findByCriteria(AccountSearchBuilder criteria) {
        return (root, query, cb) -> {
            root.fetch("user", JoinType.LEFT);
            root.fetch("admin", JoinType.LEFT);
            query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isFalse(root.get("deleted")));

            if (criteria.getId() != null) {
                predicates.add(cb.equal(root.get("id"), criteria.getId()));
            }
            if (StringUtils.hasText(criteria.getUsername())) {
                predicates.add(cb.like(root.get("username"), "%" + criteria.getUsername() + "%"));
            }
            if (StringUtils.hasText(criteria.getEmail())) {
                predicates.add(cb.like(root.get("email"), "%" + criteria.getEmail() + "%"));
            }
            if (StringUtils.hasText(criteria.getRole())) {
                predicates.add(cb.equal(root.get("role"), criteria.getRole()));
            }

            if (StringUtils.hasText(criteria.getFullname())) {
                Predicate userFullname = cb.like(root.join("user", JoinType.LEFT).get("fullname"), "%" + criteria.getFullname() + "%");
                Predicate adminFullname = cb.like(root.join("admin", JoinType.LEFT).get("fullname"), "%" + criteria.getFullname() + "%");
                predicates.add(cb.or(userFullname, adminFullname));
            }

            if (StringUtils.hasText(criteria.getAddress())) {
                Predicate userAddress = cb.like(root.join("user", JoinType.LEFT).get("address"), "%" + criteria.getAddress() + "%");
                Predicate adminAddress = cb.like(root.join("admin", JoinType.LEFT).get("address"), "%" + criteria.getAddress() + "%");
                predicates.add(cb.or(userAddress, adminAddress));
            }

            if (StringUtils.hasText(criteria.getStartTime())) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("created_at"), java.time.LocalDate.parse(criteria.getStartTime()).atStartOfDay()));
            }
            if (StringUtils.hasText(criteria.getEndTime())) {
                predicates.add(cb.lessThanOrEqualTo(root.get("created_at"), java.time.LocalDate.parse(criteria.getEndTime()).atTime(23, 59, 59)));
            }

            query.orderBy(cb.desc(root.get("created_at")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}