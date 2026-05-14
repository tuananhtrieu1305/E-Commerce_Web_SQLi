package com.backend.backend.repository.account.custom.impl;

import com.backend.backend.builder.account.AccountSearchBuilder;
import com.backend.backend.model.account.AccountDTO;
import com.backend.backend.model.account.ProfileDTO;
import com.backend.backend.repository.account.custom.AccountRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.lang.reflect.Field;
import java.sql.*;
import java.util.*;

@Repository
public class AccountRepositoryImpl implements AccountRepositoryCustom
{
    @PersistenceContext
    private EntityManager entityManager;

    public static void joinTable(AccountSearchBuilder accountSearchBuilder, StringBuilder sql) {
        String role = accountSearchBuilder.getRole();
        if(role.equalsIgnoreCase("USER")) {
            sql.append("SELECT a.id, a.username, a.password, a.email, a.role, a.created_at, a.updated_at, u.id, u.fullname," +
                    " " +
                    "u.address, u.image FROM accounts a ");
            sql.append("JOIN users u ON a.id = u.account_id ");
        } else if(role.equalsIgnoreCase("ADMIN")) {
            sql.append("SELECT a.id, a.username, a.password, a.email, a.role, a.created_at, a.updated_at, ad.id, ad" +
                    ".fullname," +
                    " ad" +
                    ".address, ad.image FROM accounts a ");
            sql.append("JOIN admins ad ON a.id = ad.account_id ");
        }
    }

    public static void query(AccountSearchBuilder accountSearchBuilder, StringBuilder where) {
        try {
            Field[] fields = accountSearchBuilder.getClass().getDeclaredFields();
            for(Field item : fields) {
                item.setAccessible(true);
                String FieldName = item.getName();

                if(FieldName.equals("created_at") || FieldName.equals("updated_at") || FieldName.equals("role")) {
                    continue;
                }

                Object fieldValue = item.get(accountSearchBuilder);
                if (fieldValue == null) {
                    continue;
                }
                String value = item.get(accountSearchBuilder).toString();

                if(FieldName.equals("fullname") || FieldName.equals("address")) {
                    if("USER".equalsIgnoreCase(accountSearchBuilder.getRole())) {
                        where.append("AND u.").append(FieldName).append(" LIKE '%").append(value).append("%' ");
                    } else if("ADMIN".equalsIgnoreCase(accountSearchBuilder.getRole())) {
                        where.append("AND ad.").append(FieldName).append(" LIKE '%").append(value).append("%' ");
                    }
                    continue;
                }

                if (FieldName.equals("startTime")) {
                    where.append("AND DATE(a.created_at) >= '").append(value).append("' ");
                    continue;
                }
                if (FieldName.equals("endTime")) {
                    where.append("AND DATE(a.created_at) <= '").append(value).append("' ");
                    continue;
                }

                if(FieldName.equals("id")) {
                    where.append("AND a.").append(FieldName).append(" = ").append(value).append(" ");
                } else {
                    where.append("AND a.").append(FieldName).append(" LIKE '%").append(value).append("%' ");
                }
            }
        } catch(Exception ex) {
            ex.printStackTrace();
        }
    }

    @Override
    public List<AccountDTO> getAccount(AccountSearchBuilder accountSearchBuilder) {
        StringBuilder sql = new StringBuilder();
        joinTable(accountSearchBuilder,sql);
        StringBuilder where = new StringBuilder("WHERE a.deleted = false ");
        query(accountSearchBuilder, where);
        sql.append(where);
        Query query = entityManager.createNativeQuery(sql.toString());
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

        if (!userIds.isEmpty()) {
            String ordersQuery = "SELECT o.user_id, COUNT(o.id), SUM(o.total_cost) " +
                    "FROM orders o " +
                    "WHERE o.user_id IN :userIds " +
                    "GROUP BY o.user_id";

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