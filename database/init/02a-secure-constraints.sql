-- ============================================================
-- 02a-secure-constraints.sql
-- DB validation constraints for e_commerce_secure.
-- ============================================================

USE `e_commerce_secure`;

ALTER TABLE products
    ADD CONSTRAINT chk_product_price CHECK (price >= 0),
    ADD CONSTRAINT chk_product_stock CHECK (stock >= 0);

-- Orders: phone phải đúng định dạng số 10-11 chữ số
ALTER TABLE orders
    ADD CONSTRAINT chk_order_phone CHECK (phone REGEXP '^[0-9]{10,11}$');

-- Comments: star rating phải từ 1-5
ALTER TABLE comments
    ADD CONSTRAINT chk_comment_star CHECK (star BETWEEN 1 AND 5);

-- ============================================================
-- PHẦN 2: AUDIT LOG TABLE
-- Ghi lại mọi thay đổi nhạy cảm để phát hiện tấn công
-- ============================================================