package com.backend.backend.repository.sp;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.*;

/**
 * ✅ SECURE — Database-Level Defense Layer (Layer 2)
 *
 * Repository này gọi trực tiếp các Stored Procedure trong e_commerce_secure DB.
 * Stored Procedures cung cấp:
 *   - Parameterized LIKE search (chống SQLi)
 *   - Allow-list ORDER BY mapping (chống ORDER BY injection)
 *   - SELECT ... FOR UPDATE trong transaction (chống race condition)
 *   - Audit log tự động qua Trigger
 */
@Repository
public class StoredProcedureRepository {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Gọi sp_search_products — tìm kiếm sản phẩm an toàn.
     *
     * @param keyword   từ khóa tìm theo title (nullable)
     * @param sort      allow-list key: price_asc|price_desc|name_asc|newest|oldest (nullable → default)
     * @param minPrice  giá tối thiểu (nullable)
     * @param maxPrice  giá tối đa (nullable)
     * @return List<Map<String, Object>> — mỗi map là một hàng kết quả
     */
    public List<Map<String, Object>> searchProductsViaSP(
            String keyword, String sort, Integer minPrice, Integer maxPrice) {

        // Gọi SP qua native query CALL
        Query q = entityManager.createNativeQuery(
                "CALL sp_search_products(:keyword, :sort, :minPrice, :maxPrice)"
        );
        q.setParameter("keyword",  keyword  != null ? keyword  : "");
        q.setParameter("sort",     sort     != null ? sort     : "newest");
        q.setParameter("minPrice", minPrice);
        q.setParameter("maxPrice", maxPrice);

        List<Object[]> rows = q.getResultList();
        return mapRows(rows,
                "id", "title", "product_info", "price", "stock", "created_at",
                "cate_name", "seller_name");
    }

    /**
     * Gọi sp_get_account_safe — lookup account mà KHÔNG trả về password.
     *
     * @param username tên đăng nhập cần tìm
     * @return Optional chứa thông tin public của account (không có password)
     */
    public Optional<Map<String, Object>> getAccountSafeViaSP(String username) {
        Query q = entityManager.createNativeQuery(
                "CALL sp_get_account_safe(:username)"
        );
        q.setParameter("username", username);

        List<Object[]> rows = q.getResultList();
        List<Map<String, Object>> mapped = mapRows(rows,
                "id", "username", "email", "role", "created_at", "deleted");

        return mapped.isEmpty() ? Optional.empty() : Optional.of(mapped.get(0));
    }

    /**
     * Gọi sp_create_order_safe — tạo order trong transaction với stock lock.
     * SP tự xử lý: stock check → INSERT order → INSERT order_item → INSERT payment → COMMIT
     *
     * @return orderId nếu thành công, ném RuntimeException nếu SP báo lỗi
     */
    public int createOrderViaSP(
            int userId, String address, String phone, String note,
            int prodId, int quantity, String method) {

        // Dùng raw JDBC thông qua unwrap để gọi SP với OUT parameter
        // EntityManager không hỗ trợ OUT param trực tiếp → dùng CallableStatement
        try {
            var connection = entityManager.unwrap(java.sql.Connection.class);
            try (var cs = connection.prepareCall(
                    "CALL sp_create_order_safe(?,?,?,?,?,?,?,?,?)")) {

                cs.setInt(1, userId);
                cs.setString(2, address);
                cs.setString(3, phone);
                cs.setString(4, note);
                cs.setInt(5, prodId);
                cs.setInt(6, quantity);
                cs.setString(7, method != null ? method : "COD");
                cs.registerOutParameter(8, java.sql.Types.INTEGER);   // OUT p_order_id
                cs.registerOutParameter(9, java.sql.Types.VARCHAR);   // OUT p_message

                cs.execute();

                int orderId = cs.getInt(8);
                if (orderId <= 0) {
                    throw new RuntimeException(cs.getString(9));
                }
                return orderId;
            }
        } catch (java.sql.SQLException e) {
            // Unwrap SP SIGNAL message cho client
            throw new RuntimeException("[SP ERROR] " + e.getMessage(), e);
        }
    }

    /**
     * Gọi sp_get_audit_log — xem log bảo mật gần đây.
     *
     * @param limit số bản ghi tối đa (mặc định 50)
     * @return danh sách security events
     */
    public List<Map<String, Object>> getAuditLogViaSP(int limit) {
        Query q = entityManager.createNativeQuery(
                "CALL sp_get_audit_log(:lim)"
        );
        q.setParameter("lim", limit > 0 ? limit : 50);

        List<Object[]> rows = q.getResultList();
        return mapRows(rows,
            "id", "event_time", "db_name", "table_name", "operation",
            "affected_id", "old_value", "new_value", "notes", "severity");
    }

    // ── Helper ─────────────────────────────────────────────────────────────

    /**
     * Map mảng Object[] từ native query sang List<Map<String, Object>>.
     * Xử lý Timestamp → String để dễ serialize JSON.
     */
    private List<Map<String, Object>> mapRows(List<Object[]> rows, String... columns) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            for (int i = 0; i < columns.length && i < row.length; i++) {
                Object val = row[i];
                if (val instanceof Timestamp ts) {
                    val = ts.toLocalDateTime().toString();
                }
                map.put(columns[i], val);
            }
            result.add(map);
        }
        return result;
    }
}
