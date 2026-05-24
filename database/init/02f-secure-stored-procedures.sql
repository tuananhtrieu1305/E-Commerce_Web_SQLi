-- ============================================================
-- 02f-secure-stored-procedures.sql
-- Stored procedures used by the secure backend.
-- ============================================================

USE `e_commerce_secure`;

DELIMITER $$

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
    -- ✅ Đọc từ v_accounts_public để kết quả không có password và email đã được mask.
    SET @p_uname = p_username;
    PREPARE stmt FROM
        'SELECT id, username, email, role, created_at, deleted
         FROM v_accounts_public
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
        'SELECT id, event_time, table_name, operation, affected_id,
                old_value, new_value, notes
         FROM security_audit_log
         ORDER BY event_time DESC
         LIMIT ?';
    EXECUTE stmt USING @lim;
    DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;
