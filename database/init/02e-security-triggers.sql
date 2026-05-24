-- ============================================================
-- 02e-security-triggers.sql
-- DB hard-reject and audit triggers.
-- ============================================================

USE `e_commerce_secure`;

DELIMITER $$

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
    IF fn_is_sqli_payload(NEW.title) OR fn_is_sqli_payload(NEW.product_info) THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('products', 'SQLI_REJECTED', CONCAT_WS(' | ', NEW.title, NEW.product_info),
                'DB regex hard-reject', 'Rejected suspicious product title/product_info update');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Suspicious SQL payload rejected in product data';
    END IF;
END$$

-- ── 4C: Validate account username trước INSERT ─────────────
-- Từ chối username chứa ký tự SQL injection phổ biến
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

-- ── 4D: Validate account username trước UPDATE ─────────────
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

-- ── 4E: Audit log — phát hiện thay đổi role (Privilege Escalation) ──
CREATE TRIGGER trg_audit_role_change
BEFORE UPDATE ON accounts
FOR EACH ROW
BEGIN
    IF OLD.role != NEW.role THEN
        INSERT INTO security_audit_log
            (table_name, operation, affected_id, old_value, new_value, notes)
        VALUES
            ('accounts', 'PRIVILEGE_ESCALATION_ATTEMPT',
             OLD.id, OLD.role, NEW.role,
             CONCAT('Username: ', OLD.username, ' — role changed'));
    END IF;
END$$

-- ── 4F: Audit log — phát hiện bulk soft-delete tài khoản ───
-- Nếu trong 1 transaction có hơn 5 tài khoản bị deleted=1, ghi log cảnh báo
CREATE TRIGGER trg_audit_account_mass_delete
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    IF OLD.deleted = 0 AND NEW.deleted = 1 THEN
        INSERT INTO security_audit_log
            (table_name, operation, affected_id, old_value, new_value, notes)
        VALUES
            ('accounts', 'SOFT_DELETE',
             OLD.id, 'deleted=0', 'deleted=1',
             CONCAT('Account soft-deleted: ', OLD.username));
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
    IF fn_is_sqli_payload(NEW.note) THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('orders', 'SQLI_REJECTED', NEW.note,
                'DB regex hard-reject', 'Rejected suspicious order note');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Suspicious SQL payload rejected in order note';
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
    IF fn_is_sqli_payload(NEW.note) THEN
        INSERT INTO security_reject_log(table_name, operation, payload, reason, notes)
        VALUES ('orders', 'SQLI_REJECTED', NEW.note,
                'DB regex hard-reject', 'Rejected suspicious order note update');
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Suspicious SQL payload rejected in order note';
    END IF;
END$$

-- ── 4I: Hard-reject suspicious persisted comment content ─────
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
