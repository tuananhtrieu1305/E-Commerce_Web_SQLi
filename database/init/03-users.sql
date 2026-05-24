-- ============================================================
-- 03-users.sql
-- Cấu trúc phân quyền 2 lớp (Dual-Layer Privilege)
-- Tạo user app_secure (Backend) và đảm bảo sp_definer đã có quyền đầy đủ
--
-- [SECURITY FIX] Least Privilege — Thu hồi DELETE khỏi toàn bộ views:
--   Quyền DELETE trên view đồng nghĩa với Hard Delete vật lý.
--   Mọi thao tác "xóa" của Backend PHẢI là Soft Delete:
--       UPDATE v_xxx SET deleted = true WHERE id = ?
--   Không có quyền DELETE → không thể xóa vật lý dù backend bị xâm phạm.
-- ============================================================

-- 1. sp_definer đã được tạo trong 01.9-create-definer-user.sql
-- Đảm bảo quyền đầy đủ (idempotent)
CREATE USER IF NOT EXISTS 'sp_definer'@'%' IDENTIFIED BY 'DefinerPass@2024';
GRANT ALL PRIVILEGES ON `e_commerce_secure`.* TO 'sp_definer'@'%';

-- 2. User cho backend-secure:
CREATE USER IF NOT EXISTS 'app_secure'@'%' IDENTIFIED BY 'SecurePass@2024';

-- THU HỒI toàn bộ đặc quyền trên SCHEMA (chỉ để chắc chắn)
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'app_secure'@'%';

-- 3. Chỉ cấp quyền SELECT, INSERT, UPDATE trên các VIEWS
-- [SECURITY] DELETE bị loại bỏ hoàn toàn — Soft Delete qua UPDATE ... SET deleted = true
-- Updatable 1-to-1 views — JPA entity mapping
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_accounts_public` TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_admins`          TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_cart_items`      TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_carts`           TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_categories`      TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_comments`        TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_order_items`     TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_orders`          TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_payments`        TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_product_images`  TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_products`        TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_sellers`         TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_users`           TO 'app_secure'@'%';

-- View đặc thù (read-only — dùng cho reporting/display)
GRANT SELECT ON `e_commerce_secure`.`v_products_active` TO 'app_secure'@'%';
GRANT SELECT ON `e_commerce_secure`.`v_order_summary`   TO 'app_secure'@'%';

-- 4. Cấp quyền EXECUTE để gọi Stored Procedures
-- Backend xác thực đăng nhập qua sp_authenticate_account (có password_hash)
-- Backend tìm kiếm qua sp_search_products, tạo order qua sp_create_order_safe, v.v.
GRANT EXECUTE ON `e_commerce_secure`.* TO 'app_secure'@'%';

-- KHÔNG CÓ RAW TABLE ACCESS (Sẽ bị từ chối nếu backend gửi query "SELECT * FROM accounts")
-- KHÔNG CÓ: DELETE (xóa vật lý) trên bất kỳ view nào
-- KHÔNG CÓ: DROP, ALTER, CREATE, TRUNCATE, GRANT

FLUSH PRIVILEGES;

-- Verification
SHOW GRANTS FOR 'app_secure'@'%';
