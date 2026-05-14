package com.backend.backend.repository.account.custom.impl;

import com.backend.backend.builder.account.AccountSearchBuilder;
import com.backend.backend.model.account.AccountDTO;
import com.backend.backend.model.account.ProfileDTO;
import com.backend.backend.repository.account.custom.AccountRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.*;

// ============================================================
// ✅ SECURE: Parameterized Queries — chống SQL Injection
// Tất cả user input được truyền qua setParameter(), KHÔNG concat chuỗi
// ============================================================
@Repository
public class AccountRepositoryImpl implements AccountRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<AccountDTO> getAccount(AccountSearchBuilder builder) {
        String role = builder.getRole();
        StringBuilder sql = new StringBuilder();
        Map<String, Object> paramMap = new LinkedHashMap<>();

        // ✅ JOIN table dựa trên role (safe — role đã qua allow-list)
        if ("USER".equalsIgnoreCase(role)) {
            sql.append("SELECT a.id, a.username, a.password, a.email, a.role, a.created_at, a.updated_at, "
                    + "u.id, u.fullname, u.address, u.image FROM accounts a "
                    + "JOIN users u ON a.id = u.account_id ");
        } else if ("ADMIN".equalsIgnoreCase(role)) {
            sql.append("SELECT a.id, a.username, a.password, a.email, a.role, a.created_at, a.updated_at, "
                    + "ad.id, ad.fullname, ad.address, ad.image FROM accounts a "
                    + "JOIN admins ad ON a.id = ad.account_id ");
        } else {
            return new ArrayList<>();
        }

        StringBuilder where = new StringBuilder("WHERE a.deleted = false ");

        // ✅ Parameterized: user input → :param → setParameter()
        if (builder.getId() != null) {
            where.append("AND a.id = :id ");
            paramMap.put("id", builder.getId());
        }
        if (builder.getUsername() != null && !builder.getUsername().isEmpty()) {
            where.append("AND a.username LIKE :username ");
            paramMap.put("username", "%" + builder.getUsername() + "%");
        }
        if (builder.getEmail() != null && !builder.getEmail().isEmpty()) {
            where.append("AND a.email LIKE :email ");
            paramMap.put("email", "%" + builder.getEmail() + "%");
        }
        if (builder.getFullname() != null && !builder.getFullname().isEmpty()) {
            String profileAlias = "USER".equalsIgnoreCase(role) ? "u" : "ad";
            where.append("AND ").append(profileAlias).append(".fullname LIKE :fullname ");
            paramMap.put("fullname", "%" + builder.getFullname() + "%");
        }
        if (builder.getAddress() != null && !builder.getAddress().isEmpty()) {
            String profileAlias = "USER".equalsIgnoreCase(role) ? "u" : "ad";
            where.append("AND ").append(profileAlias).append(".address LIKE :address ");
            paramMap.put("address", "%" + builder.getAddress() + "%");
        }
        if (builder.getStartTime() != null && !builder.getStartTime().isEmpty()) {
            where.append("AND DATE(a.created_at) >= :startTime ");
            paramMap.put("startTime", builder.getStartTime());
        }
        if (builder.getEndTime() != null && !builder.getEndTime().isEmpty()) {
            where.append("AND DATE(a.created_at) <= :endTime ");
            paramMap.put("endTime", builder.getEndTime());
        }

        sql.append(where);
        Query query = entityManager.createNativeQuery(sql.toString());

        // ✅ Bind tất cả parameter an toàn
        paramMap.forEach(query::setParameter);

        List<Object[]> results = query.getResultList();
        List<AccountDTO> accounts = new ArrayList<>();

        List<Integer> userIds = new ArrayList<>();
        Map<Integer, AccountDTO> accountMap = new HashMap<>();

        for (Object[] row : results) {
            AccountDTO dto = new AccountDTO();
            dto.setId((Integer) row[0]);
            dto.setUsername((String) row[1]);
            dto.setEmail((String) row[3]);
            dto.setRole((String) row[4]);
            dto.setCreated_at(row[5] != null ? ((Timestamp) row[5]).toLocalDateTime() : null);
            dto.setUpdated_at(row[6] != null ? ((Timestamp) row[6]).toLocalDateTime() : null);

            ProfileDTO profile = new ProfileDTO();
            profile.setId((Integer) row[7]);
            profile.setFullname((String) row[8]);
            profile.setAddress((String) row[9]);
            if (row[10] != null) {
                profile.setImage((String) row[10]);
            }

            dto.setProfile(profile);
            accounts.add(dto);

            if ("USER".equals(dto.getRole())) {
                userIds.add(profile.getId());
                accountMap.put(profile.getId(), dto);
            }
        }

        // ✅ Order stats query cũng dùng parameterized
        if (!userIds.isEmpty()) {
            String ordersQuery = "SELECT o.user_id, COUNT(o.id), SUM(o.total_cost) "
                    + "FROM orders o "
                    + "WHERE o.user_id IN :userIds "
                    + "GROUP BY o.user_id";

            Query ordersQueryObj = entityManager.createNativeQuery(ordersQuery);
            ordersQueryObj.setParameter("userIds", userIds);
            List<Object[]> ordersResults = ordersQueryObj.getResultList();

            for (Object[] row : ordersResults) {
                Integer userId = (Integer) row[0];
                Long orderCount = (Long) row[1];
                Number totalAmount = (Number) row[2];

                AccountDTO account = accountMap.get(userId);
                if (account != null) {
                    account.setOrderCount(orderCount != null ? orderCount.intValue() : 0);
                    account.setTotalOrderPrice(totalAmount != null ? totalAmount.intValue() : 0);
                }
            }

            for (AccountDTO account : accounts) {
                if (account.getOrderCount() == null) {
                    account.setOrderCount(0);
                }
                if (account.getTotalOrderPrice() == null) {
                    account.setTotalOrderPrice(0);
                }
            }
        }
        return accounts;
    }
}