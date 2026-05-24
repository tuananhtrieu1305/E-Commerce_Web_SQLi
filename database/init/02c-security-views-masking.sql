-- ============================================================
-- 02c-security-views-masking.sql
-- Security views and database-side data masking.
-- ============================================================

USE `e_commerce_secure`;

CREATE OR REPLACE VIEW v_accounts_public AS
SELECT
    id,
    username,
    CASE
        WHEN email IS NULL OR email = '' THEN NULL
        WHEN LOCATE('@', email) > 1 THEN
            CONCAT(LEFT(email, 1), '***', SUBSTRING(email, LOCATE('@', email)))
        ELSE '***'
    END AS email,
    role,
    created_at,
    updated_at,
    deleted
FROM accounts;

-- View: chỉ show sản phẩm chưa bị xóa, bỏ seller_id/cate_id raw
CREATE OR REPLACE VIEW v_products_active AS
SELECT
    p.id,
    p.title,
    p.product_info,
    p.price,
    p.stock,
    p.created_at,
    c.cate_name,
    s.seller_name
FROM products p
LEFT JOIN categories c ON p.cate_id = c.id
LEFT JOIN sellers    s ON p.seller_id = s.id
WHERE p.deleted = 0;

-- View: order summary — ẩn note và địa chỉ chi tiết, chỉ show aggregate
CREATE OR REPLACE VIEW v_order_summary AS
SELECT
    o.id          AS order_id,
    o.user_id,
    o.total_cost,
    o.created_at,
    o.deleted,
    COUNT(oi.id)  AS item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.deleted = 0
GROUP BY o.id, o.user_id, o.total_cost, o.created_at, o.deleted;

-- ============================================================
-- PHẦN 4: TRIGGERS
-- Validate input + audit logging tại tầng DB
-- Hoạt động độc lập với backend — ngay cả khi backend bị bypass
-- ============================================================