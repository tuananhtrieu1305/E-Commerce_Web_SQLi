package com.backend.backend.utils;

import java.util.Map;
import java.util.Set;

/**
 * ✅ SECURE: ORDER BY Allow-list Utility
 * Chặn SQL Injection qua tham số sort bằng cách chỉ cho phép
 * các column name nằm trong whitelist được sử dụng.
 */
public class SortUtil {

    // ═══════════════════════════════════════════════
    // Allow-list cho các bảng chính
    // ═══════════════════════════════════════════════

    private static final Set<String> PRODUCT_SORT_COLUMNS = Set.of(
            "id", "title", "price", "stock", "created_at", "updated_at"
    );

    private static final Set<String> ACCOUNT_SORT_COLUMNS = Set.of(
            "id", "username", "email", "role", "created_at", "updated_at"
    );

    private static final Set<String> ORDER_SORT_COLUMNS = Set.of(
            "id", "total_cost", "address", "phone", "created_at", "updated_at"
    );

    private static final Set<String> ALLOWED_DIRECTIONS = Set.of("ASC", "DESC");

    // Map entity → allowed columns
    private static final Map<String, Set<String>> ENTITY_COLUMN_MAP = Map.of(
            "product", PRODUCT_SORT_COLUMNS,
            "account", ACCOUNT_SORT_COLUMNS,
            "order", ORDER_SORT_COLUMNS
    );

    /**
     * Validate và trả về column name an toàn cho ORDER BY.
     * Nếu column không nằm trong allow-list → trả về defaultColumn.
     *
     * @param entityType  loại entity: "product", "account", "order"
     * @param sortBy      tên cột client gửi lên
     * @param defaultColumn cột mặc định nếu không hợp lệ
     * @return cột hợp lệ hoặc defaultColumn
     */
    public static String validateSortColumn(String entityType, String sortBy, String defaultColumn) {
        if (sortBy == null || sortBy.isBlank()) {
            return defaultColumn;
        }

        Set<String> allowedColumns = ENTITY_COLUMN_MAP.get(entityType.toLowerCase());
        if (allowedColumns == null) {
            return defaultColumn;
        }

        String normalized = sortBy.trim().toLowerCase();
        if (allowedColumns.contains(normalized)) {
            return normalized;
        }

        return defaultColumn;
    }

    /**
     * Validate sort direction (ASC / DESC).
     * Nếu không hợp lệ → trả về "ASC".
     */
    public static String validateSortDirection(String direction) {
        if (direction == null || direction.isBlank()) {
            return "ASC";
        }
        String normalized = direction.trim().toUpperCase();
        if (ALLOWED_DIRECTIONS.contains(normalized)) {
            return normalized;
        }
        return "ASC";
    }

    /**
     * Tạo chuỗi ORDER BY an toàn.
     * Ví dụ: "ORDER BY p.price DESC"
     */
    public static String buildOrderByClause(String entityAlias, String entityType,
                                             String sortBy, String direction) {
        String validColumn = validateSortColumn(entityType, sortBy, "id");
        String validDirection = validateSortDirection(direction);
        return " ORDER BY " + entityAlias + "." + validColumn + " " + validDirection;
    }
}
