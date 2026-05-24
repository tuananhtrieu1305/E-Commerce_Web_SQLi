-- ============================================================
-- Apply DB Regex Hard-Reject customizations to an existing DB.
-- Purpose:
--   Reject suspicious SQLi-like payloads before they are persisted.
--   This reduces second-order SQL Injection risk for long-lived input fields.
--
-- Scope:
--   - accounts.username
--   - products.title, products.product_info
--   - comments.content
--   - orders.note
--
-- Notes:
--   security_reject_log uses MyISAM intentionally so rejected writes still
--   leave evidence even when the triggering INSERT/UPDATE fails.
-- ============================================================

USE `e_commerce_secure`;

CREATE TABLE IF NOT EXISTS security_reject_log (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    event_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    table_name  VARCHAR(50)  NOT NULL,
    operation   VARCHAR(30)  NOT NULL,
    payload     TEXT         DEFAULT NULL,
    reason      VARCHAR(255) DEFAULT NULL,
    notes       TEXT         DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS trg_validate_product_insert;
DROP TRIGGER IF EXISTS trg_validate_product_update;
DROP TRIGGER IF EXISTS trg_validate_account_insert;
DROP TRIGGER IF EXISTS trg_validate_account_update;
DROP TRIGGER IF EXISTS trg_validate_order_phone_insert;
DROP TRIGGER IF EXISTS trg_validate_order_phone_update;
DROP TRIGGER IF EXISTS trg_validate_comment_content_insert;
DROP TRIGGER IF EXISTS trg_validate_comment_content_update;
DROP TRIGGER IF EXISTS trg_security_audit_comments_before_insert_secure;
DROP FUNCTION IF EXISTS fn_is_sqli_payload;

DELIMITER $$

CREATE FUNCTION fn_is_sqli_payload(p_value TEXT)
RETURNS TINYINT
DETERMINISTIC
BEGIN
    IF p_value IS NULL OR TRIM(p_value) = '' THEN
        RETURN 0;
    END IF;

    IF REGEXP_LIKE(
        p_value,
        '(union[[:space:]]+.*select|select[[:space:]]+.*from|information_schema|sleep[[:space:]]*\\(|benchmark[[:space:]]*\\(|extractvalue[[:space:]]*\\(|updatexml[[:space:]]*\\(|drop[[:space:]]+table|or[[:space:]]+1[[:space:]]*=[[:space:]]*1|and[[:space:]]+1[[:space:]]*=[[:space:]]*1|--|/\\*|\\*/|;)',
        'i'
    ) THEN
        RETURN 1;
    END IF;

    RETURN 0;
END$$

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
    IF fn_is_sqli_payload(NEW.title) OR fn_is_sqli_payload(NEW.product_info) THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('products', 'SQLI_REJECTED', CONCAT_WS(' | ', NEW.title, NEW.product_info),
                'DB regex hard-reject', 'Rejected suspicious product title/product_info');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Suspicious SQL payload rejected in product data';
    END IF;
END$$

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
    IF fn_is_sqli_payload(NEW.title) OR fn_is_sqli_payload(NEW.product_info) THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('products', 'SQLI_REJECTED', CONCAT_WS(' | ', NEW.title, NEW.product_info),
                'DB regex hard-reject', 'Rejected suspicious product title/product_info update');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Suspicious SQL payload rejected in product data';
    END IF;
END$$

CREATE TRIGGER trg_validate_account_insert
BEFORE INSERT ON accounts
FOR EACH ROW
BEGIN
    IF fn_is_sqli_payload(NEW.username)
        OR NEW.username REGEXP '[\'\"\\\\;]'
        OR NEW.username LIKE '%xp_%'
    THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('accounts', 'SQLI_REJECTED', NEW.username,
                'DB regex hard-reject', 'Rejected suspicious account username');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Invalid characters detected in username';
    END IF;
END$$

CREATE TRIGGER trg_validate_account_update
BEFORE UPDATE ON accounts
FOR EACH ROW
BEGIN
    IF fn_is_sqli_payload(NEW.username)
        OR NEW.username REGEXP '[\'\"\\\\;]'
    THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('accounts', 'SQLI_REJECTED', NEW.username,
                'DB regex hard-reject', 'Rejected suspicious account username update');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Invalid characters detected in username';
    END IF;
END$$

CREATE TRIGGER trg_validate_order_phone_insert
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.phone IS NOT NULL AND NEW.phone NOT REGEXP '^[0-9]{10,11}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Phone must be 10-11 digits only';
    END IF;
    IF fn_is_sqli_payload(NEW.note) THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('orders', 'SQLI_REJECTED', NEW.note,
                'DB regex hard-reject', 'Rejected suspicious order note');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Suspicious SQL payload rejected in order note';
    END IF;
END$$

CREATE TRIGGER trg_validate_order_phone_update
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.phone IS NOT NULL AND NEW.phone NOT REGEXP '^[0-9]{10,11}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Phone must be 10-11 digits only';
    END IF;
    IF fn_is_sqli_payload(NEW.note) THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('orders', 'SQLI_REJECTED', NEW.note,
                'DB regex hard-reject', 'Rejected suspicious order note update');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Suspicious SQL payload rejected in order note';
    END IF;
END$$

CREATE TRIGGER trg_validate_comment_content_insert
BEFORE INSERT ON comments
FOR EACH ROW
BEGIN
    IF fn_is_sqli_payload(NEW.content) THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('comments', 'SQLI_REJECTED', NEW.content,
                'DB regex hard-reject', 'Rejected suspicious comment content');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Suspicious SQL payload rejected in comment content';
    END IF;
END$$

CREATE TRIGGER trg_validate_comment_content_update
BEFORE UPDATE ON comments
FOR EACH ROW
BEGIN
    IF fn_is_sqli_payload(NEW.content) THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('comments', 'SQLI_REJECTED', NEW.content,
                'DB regex hard-reject', 'Rejected suspicious comment content update');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Suspicious SQL payload rejected in comment content';
    END IF;
END$$

DELIMITER ;

SHOW TRIGGERS WHERE `Table` IN ('accounts', 'products', 'comments', 'orders');
