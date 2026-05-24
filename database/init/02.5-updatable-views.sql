-- ============================================================
-- 02.5-updatable-views.sql
-- DB-side SQL Allowlist Gateway - Updatable Views
--
-- Expose raw tables as 1-to-1 views so that JPA can map to them without breaking,
-- while app_secure's privileges on base tables are fully revoked.
--
-- [SECURITY FIX] Virtual Data Masking:
--   - v_accounts_public: SELECT * replaced with explicit safe columns.
--     Cột password_hash bị ẩn hoàn toàn tại tầng View.
--     Backend muốn xác thực mật khẩu PHẢI gọi Stored Procedure riêng (sp_authenticate_account).
-- ============================================================

USE `e_commerce_secure`;

-- ── accounts: DATA MASKING — chỉ expose các cột an toàn, ẨN password_hash ──
-- [SECURITY] Đổi tên thành v_accounts_public để thể hiện rõ đây là view công khai.
-- Lý do: SELECT * FROM accounts sẽ lộ password_hash cho bất kỳ ai có quyền SELECT trên view.
-- Backend PHẢI gọi sp_authenticate_account để xác thực — không được đọc password trực tiếp.
CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_accounts_public AS
SELECT
    id,
    username,
    email,
    role,
    created_at,
    updated_at,
    deleted
FROM accounts;

-- ── Các view còn lại — khai báo rõ cột thay vì SELECT * ──────────────────────
CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_admins AS
SELECT id, account_id, created_at FROM admins;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_cart_items AS
SELECT id, cart_id, prod_id, quantity FROM cart_items;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_carts AS
SELECT id, account_id, created_at, updated_at FROM carts;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_categories AS
SELECT id, cate_name FROM categories;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_comments AS
SELECT id, account_id, prod_id, content, star, created_at, updated_at, deleted FROM comments;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_order_items AS
SELECT id, order_id, prod_id, item_quantity, item_price FROM order_items;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_orders AS
SELECT id, user_id, total_cost, address, phone, note, payment_method, status, created_at, updated_at, deleted FROM orders;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_payments AS
SELECT id, order_id, method, status, paid_at FROM payments;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_product_images AS
SELECT id, prod_id, image_url FROM product_images;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_products AS
SELECT id, title, product_info, price, stock, cate_id, seller_id, created_at, updated_at, deleted FROM products;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_sellers AS
SELECT id, seller_name, account_id, created_at FROM sellers;

CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_users AS
SELECT id, full_name, phone, address, profile_picture, account_id FROM users;
