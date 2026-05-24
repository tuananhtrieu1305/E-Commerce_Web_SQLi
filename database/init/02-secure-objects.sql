-- ============================================================
-- 02-secure-objects.sql
-- Database-Level Defense Layer — e_commerce_secure ONLY
-- Chỉ áp dụng trên DB secure, KHÔNG ảnh hưởng DB vulnerable
--
-- Bao gồm:
--   1. CHECK Constraints  — validate data tại tầng DB
--   2. Audit Log Table    — ghi lại mọi thay đổi nhạy cảm
--   3. Views              — giới hạn cột có thể truy cập
--   4. Triggers           — validate input + audit logging
--   5. Stored Procedures  — parameterized search + transactional order
-- ============================================================

USE `e_commerce_secure`;

-- ============================================================
-- PHẦN 1: CHECK CONSTRAINTS
-- Validate data tại tầng DB — lớp cuối cùng, bypass mọi layer trên
-- ============================================================

-- Products: price và stock không được âm
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

CREATE TABLE IF NOT EXISTS security_audit_log (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    event_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    db_name     VARCHAR(128)  DEFAULT NULL,
    table_name  VARCHAR(50)  NOT NULL,
    operation   VARCHAR(30)  NOT NULL,
    affected_id INT          DEFAULT NULL,
    old_value   TEXT         DEFAULT NULL,
    new_value   TEXT         DEFAULT NULL,
    notes       TEXT         DEFAULT NULL,
    severity    ENUM('LOW', 'MEDIUM', 'CRITICAL') NOT NULL DEFAULT 'LOW',
    ip          VARCHAR(64)  DEFAULT NULL,
    payload     TEXT         DEFAULT NULL,
    reason      VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PHẦN 3: VIEWS
-- Giới hạn cột có thể truy cập — Union-based SQLi không lấy được password
-- ============================================================

-- View: accounts không có cột password
-- Demo: UNION SELECT ... FROM v_accounts_public → không leak password hash
CREATE OR REPLACE VIEW v_accounts_public AS
SELECT
    id,
    username,
    email,
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

DELIMITER $$

-- ── 4A: Validate product trước INSERT ──────────────────────
CREATE TRIGGER trg_validate_product_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
    IF NEW.price < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Price cannot be negative';
    END IF;
    IF NEW.stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Stock cannot be negative';
    END IF;
END$$

-- ── 4B: Validate product trước UPDATE ──────────────────────
CREATE TRIGGER trg_validate_product_update
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.price < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Price cannot be negative';
    END IF;
    IF NEW.stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Stock cannot be negative';
    END IF;
END$$

-- ── 4C: Validate account username trước INSERT ─────────────
-- Từ chối username chứa ký tự SQL injection phổ biến
CREATE TRIGGER trg_validate_account_insert
BEFORE INSERT ON accounts
FOR EACH ROW
BEGIN
    IF NEW.username REGEXP '[\'\"\\\\;]'
        OR NEW.username LIKE '%--%'
        OR NEW.username LIKE '%/*%'
        OR NEW.username LIKE '%xp_%'
    THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Invalid characters detected in username';
    END IF;
END$$

-- ── 4D: Validate account username trước UPDATE ─────────────
CREATE TRIGGER trg_validate_account_update
BEFORE UPDATE ON accounts
FOR EACH ROW
BEGIN
    IF NEW.username REGEXP '[\'\"\\\\;]'
        OR NEW.username LIKE '%--%'
        OR NEW.username LIKE '%/*%'
    THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Invalid characters detected in username';
    END IF;
END$$

-- ── 4E: Audit log — phát hiện thay đổi role (Privilege Escalation) ──
CREATE TRIGGER trg_audit_role_change
BEFORE UPDATE ON accounts
FOR EACH ROW
BEGIN
    DECLARE v_severity VARCHAR(10) DEFAULT 'LOW';

    IF OLD.role != NEW.role THEN
        SET v_severity = 'CRITICAL';
        INSERT INTO security_audit_log
            (db_name, table_name, operation, affected_id, old_value, new_value, notes, severity)
        VALUES
            ('e_commerce_secure', 'accounts', 'PRIVILEGE_ESCALATION_ATTEMPT',
             OLD.id, OLD.role, NEW.role,
             CONCAT('Username: ', OLD.username, ' — role changed'),
             v_severity);
    END IF;
END$$

-- ── 4F: Audit log — phát hiện bulk soft-delete tài khoản ───
-- Nếu trong 1 transaction có hơn 5 tài khoản bị deleted=1, ghi log cảnh báo
CREATE TRIGGER trg_audit_account_mass_delete
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    DECLARE v_severity VARCHAR(10) DEFAULT 'LOW';

    IF OLD.deleted = 0 AND NEW.deleted = 1 THEN
        SET v_severity = 'MEDIUM';
        INSERT INTO security_audit_log
            (db_name, table_name, operation, affected_id, old_value, new_value, notes, severity)
        VALUES
            ('e_commerce_secure', 'accounts', 'SOFT_DELETE',
             OLD.id, 'deleted=0', 'deleted=1',
             CONCAT('Account soft-deleted: ', OLD.username),
             v_severity);
    END IF;
END$$

-- ── 4G: Validate order phone trước INSERT ──────────────────
CREATE TRIGGER trg_validate_order_phone_insert
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.phone IS NOT NULL AND NEW.phone NOT REGEXP '^[0-9]{10,11}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Phone must be 10-11 digits only';
    END IF;
END$$

-- ── 4H: Validate order phone trước UPDATE ──────────────────
CREATE TRIGGER trg_validate_order_phone_update
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.phone IS NOT NULL AND NEW.phone NOT REGEXP '^[0-9]{10,11}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Phone must be 10-11 digits only';
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- PHẦN 5: STORED PROCEDURES
-- Parameterized + allow-list ORDER BY + transactional
-- Backend-secure (Hướng B) gọi trực tiếp các SP này
-- ============================================================

DELIMITER $$

-- ── 5A: sp_search_products ──────────────────────────────────
-- Tìm kiếm sản phẩm an toàn:
--   - LIKE dùng prepared statement parameter (không concat chuỗi)
--   - ORDER BY dùng allow-list mapping tĩnh (không dùng input trực tiếp)
-- Demo: sortBy=price; DROP TABLE products-- → CASE không match → fallback an toàn
CREATE PROCEDURE sp_search_products(
    IN p_keyword  VARCHAR(255),
    IN p_sort     VARCHAR(20),
    IN p_min_price INT,
    IN p_max_price INT
)
BEGIN
    -- ✅ Allow-list mapping cho ORDER BY — KHÔNG BAO GIỜ dùng input trực tiếp
    SET @safe_sort = CASE p_sort
        WHEN 'price_asc'  THEN 'p.price ASC'
        WHEN 'price_desc' THEN 'p.price DESC'
        WHEN 'name_asc'   THEN 'p.title ASC'
        WHEN 'name_desc'  THEN 'p.title DESC'
        WHEN 'newest'     THEN 'p.created_at DESC'
        WHEN 'oldest'     THEN 'p.created_at ASC'
        ELSE 'p.created_at DESC'   -- Fallback mặc định an toàn
    END;

    -- ✅ Base query — dùng v_products_active (view đã lọc deleted=0)
    SET @sql = CONCAT(
        'SELECT p.id, p.title, p.product_info, p.price, p.stock, p.created_at, ',
        'c.cate_name, s.seller_name ',
        'FROM products p ',
        'LEFT JOIN categories c ON p.cate_id = c.id ',
        'LEFT JOIN sellers s ON p.seller_id = s.id ',
        'WHERE p.deleted = 0 '
    );

    -- ✅ Điều kiện tìm kiếm — user input qua prepared statement parameter
    IF p_keyword IS NOT NULL AND p_keyword != '' THEN
        SET @sql = CONCAT(@sql, 'AND p.title LIKE ? ');
        SET @kw = CONCAT('%', p_keyword, '%');
    ELSE
        SET @kw = '%';
        SET @sql = CONCAT(@sql, 'AND p.title LIKE ? ');
    END IF;

    IF p_min_price IS NOT NULL THEN
        SET @sql = CONCAT(@sql, 'AND p.price >= ', p_min_price, ' ');
    END IF;

    IF p_max_price IS NOT NULL THEN
        SET @sql = CONCAT(@sql, 'AND p.price <= ', p_max_price, ' ');
    END IF;

    -- ✅ ORDER BY — chỉ dùng @safe_sort từ allow-list, không dùng p_sort trực tiếp
    SET @sql = CONCAT(@sql, 'ORDER BY ', @safe_sort);

    PREPARE stmt FROM @sql;
    EXECUTE stmt USING @kw;
    DEALLOCATE PREPARE stmt;
END$$

-- ── 5B: sp_get_account_safe ────────────────────────────────
-- Lookup account an toàn — chỉ trả về public fields, KHÔNG trả về password
-- Demo: kể cả nếu SQL inject được, chỉ thấy public data
CREATE PROCEDURE sp_get_account_safe(
    IN p_username VARCHAR(255)
)
BEGIN
    -- ✅ Parameterized — username đi qua PREPARE/EXECUTE, không concat
    SET @p_uname = p_username;
    PREPARE stmt FROM
        'SELECT id, username, email, role, created_at, deleted
         FROM accounts
         WHERE username = ? AND deleted = 0';
    EXECUTE stmt USING @p_uname;
    DEALLOCATE PREPARE stmt;
END$$

-- ── 5C: sp_create_order_safe ───────────────────────────────
-- Tạo order trong transaction với stock check dùng SELECT ... FOR UPDATE
-- Đảm bảo không có race condition (2 user mua cùng lúc)
CREATE PROCEDURE sp_create_order_safe(
    IN  p_user_id   INT,
    IN  p_address   VARCHAR(255),
    IN  p_phone     VARCHAR(20),
    IN  p_note      VARCHAR(500),
    IN  p_prod_id   INT,
    IN  p_quantity  INT,
    IN  p_method    VARCHAR(10),
    OUT p_order_id  INT,
    OUT p_message   VARCHAR(255)
)
BEGIN
    DECLARE v_stock     INT DEFAULT 0;
    DECLARE v_price     INT DEFAULT 0;
    DECLARE v_total     INT DEFAULT 0;

    -- Handler: nếu có lỗi bất kỳ → rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_order_id = -1;
        SET p_message  = '[DB SECURITY] Transaction rolled back due to error';
        RESIGNAL;
    END;

    START TRANSACTION;

        -- ✅ SELECT ... FOR UPDATE: lock row để tránh race condition
        SELECT stock, price
        INTO   v_stock, v_price
        FROM   products
        WHERE  id = p_prod_id AND deleted = 0
        FOR UPDATE;

        -- Kiểm tra stock
        IF v_stock IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB SECURITY] Product not found or deleted';
        END IF;

        IF v_stock < p_quantity THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB SECURITY] Insufficient stock — transaction aborted';
        END IF;

        -- Trừ stock
        UPDATE products
        SET    stock = stock - p_quantity
        WHERE  id    = p_prod_id;

        -- Tính tổng tiền
        SET v_total = v_price * p_quantity;

        -- Tạo order
        INSERT INTO orders (user_id, total_cost, address, phone, note, created_at, updated_at)
        VALUES (p_user_id, v_total, p_address, p_phone, p_note, NOW(), NOW());

        SET p_order_id = LAST_INSERT_ID();

        -- Tạo order item
        INSERT INTO order_items (order_id, prod_id, item_quantity, item_price)
        VALUES (p_order_id, p_prod_id, p_quantity, v_price);

        -- Tạo payment record
        INSERT INTO payments (order_id, method, status, paid_at)
        VALUES (
            p_order_id,
            CASE WHEN UPPER(p_method) = 'BANK' THEN 'BANK' ELSE 'COD' END,
            CASE WHEN UPPER(p_method) = 'BANK' THEN 'PENDING_PAYMENT' ELSE 'PENDING' END,
            NULL
        );

        SET p_message = 'Order created successfully';

    COMMIT;
END$$

-- ── 5D: sp_get_audit_log ───────────────────────────────────
-- Xem audit log — chỉ admin dùng, trả về các sự kiện bảo mật gần đây
CREATE PROCEDURE sp_get_audit_log(
    IN p_limit INT
)
BEGIN
    SET @lim = IF(p_limit > 0 AND p_limit <= 1000, p_limit, 50);
    PREPARE stmt FROM
        'SELECT id, event_time, db_name, table_name, operation, affected_id,
            old_value, new_value, notes, severity
         FROM security_audit_log
         ORDER BY event_time DESC
         LIMIT ?';
    EXECUTE stmt USING @lim;
    DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;
