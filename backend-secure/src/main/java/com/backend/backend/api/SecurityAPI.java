package com.backend.backend.api;

import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.repository.sp.StoredProcedureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * ✅ SECURE — Database-Level Defense Layer (Layer 2) API
 *
 * Các endpoint này gọi trực tiếp Stored Procedures trong MySQL:
 *   GET  /api/security/sp-search      → sp_search_products (parameterized + allow-list sort)
 *   GET  /api/security/sp-account     → sp_get_account_safe (no password column)
 *   POST /api/security/sp-order       → sp_create_order_safe (transactional + stock lock)
 *   GET  /api/security/audit-log      → sp_get_audit_log (xem security events)
 *
 * Demo so sánh:
 *   - :8081/api/product?title=' UNION SELECT...  → vulnerable, leak data
 *   - :8082/api/security/sp-search?keyword=' UNION SELECT... → SP từ chối / không có tác dụng
 */
@RestController
@RequestMapping("/api/security")
public class SecurityAPI {

    @Autowired
    private StoredProcedureRepository spRepository;

    /**
     * Tìm kiếm sản phẩm qua Stored Procedure.
     *
     * ✅ Chống SQLi:
     *   - keyword truyền qua PREPARE/EXECUTE parameter (không concat)
     *   - sortBy qua allow-list CASE mapping trong SP
     *
     * Demo payload thất bại:
     *   - keyword=' UNION SELECT 1,username,password,3,4,5,6,7--  → SP nhận như literal string
     *   - sortBy=price; DROP TABLE products--                     → CASE không match → newest
     *
     * @param keyword   từ khóa tìm kiếm (optional)
     * @param sortBy    allow-list: price_asc|price_desc|name_asc|name_desc|newest|oldest
     * @param minPrice  giá tối thiểu (optional)
     * @param maxPrice  giá tối đa (optional)
     */
    @GetMapping("/sp-search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchProductsViaSP(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice) {

        List<Map<String, Object>> results =
                spRepository.searchProductsViaSP(keyword, sortBy, minPrice, maxPrice);

        return ResponseEntity.ok(ApiResponse.success(results,
                "[DB Layer 2] sp_search_products executed — parameterized + allow-list sort"));
    }

    /**
     * Lookup account qua Stored Procedure — KHÔNG trả về password.
     *
     * ✅ Chống data exposure:
     *   - SP chỉ SELECT các cột public (id, username, email, role, created_at, deleted)
     *   - Kể cả nếu SQLi được, cột password không tồn tại trong result set
     *
     * @param username tên tài khoản cần tìm
     */
    @GetMapping("/sp-account")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAccountSafeViaSP(
            @RequestParam String username) {

        Optional<Map<String, Object>> account =
                spRepository.getAccountSafeViaSP(username);

        if (account.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, "Account not found"));
        }

        return ResponseEntity.ok(ApiResponse.success(account.get(),
                "[DB Layer 2] sp_get_account_safe executed — password column excluded"));
    }

    /**
     * Tạo order qua Stored Procedure với transactional stock lock.
     *
     * ✅ Chống race condition:
     *   - SP dùng SELECT ... FOR UPDATE để lock row sản phẩm
     *   - Nếu stock không đủ → SP tự ROLLBACK + SIGNAL lỗi
     *   - ACID transaction đảm bảo không có partial write
     *
     * Request body:
     * {
     *   "userId": 1,
     *   "address": "Hà Nội",
     *   "phone": "0912345678",
     *   "note": "Giao nhanh",
     *   "prodId": 1,
     *   "quantity": 2,
     *   "method": "COD"
     * }
     */
    @PostMapping("/sp-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrderViaSP(
            @RequestBody Map<String, Object> body) {

        try {
            int userId   = Integer.parseInt(String.valueOf(body.get("userId")));
            String addr  = (String) body.get("address");
            String phone = (String) body.get("phone");
            String note  = (String) body.getOrDefault("note", "");
            int prodId   = Integer.parseInt(String.valueOf(body.get("prodId")));
            int qty      = Integer.parseInt(String.valueOf(body.get("quantity")));
            String method = (String) body.getOrDefault("method", "COD");

            int orderId = spRepository.createOrderViaSP(
                    userId, addr, phone, note, prodId, qty, method);

            Map<String, Object> result = Map.of(
                    "orderId", orderId,
                    "message", "Order created by sp_create_order_safe with stock lock"
            );
            return new ResponseEntity<>(
                    ApiResponse.success(result, "[DB Layer 2] Transaction committed successfully"),
                    HttpStatus.CREATED);

        } catch (RuntimeException e) {
            // SP đã ROLLBACK — trả về lỗi từ SIGNAL MESSAGE_TEXT
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(409, e.getMessage()));
        }
    }

    /**
     * Xem security audit log — ghi lại bởi Trigger tự động.
     *
     * Trigger ghi log khi:
     *   - Role thay đổi (trg_audit_role_change → PRIVILEGE_ESCALATION_ATTEMPT)
     *   - Account bị soft-delete (trg_audit_account_mass_delete → SOFT_DELETE)
     *
     * @param limit số bản ghi gần nhất (mặc định 50)
     */
    @GetMapping("/audit-log")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditLog(
            @RequestParam(defaultValue = "50") int limit) {

        List<Map<String, Object>> logs = spRepository.getAuditLogViaSP(limit);
        return ResponseEntity.ok(ApiResponse.success(logs,
                "[DB Layer 2] sp_get_audit_log — " + logs.size() + " security events"));
    }
}
