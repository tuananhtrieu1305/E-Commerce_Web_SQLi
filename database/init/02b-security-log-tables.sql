-- ============================================================
-- 02b-security-log-tables.sql
-- Audit and hard-reject log tables for e_commerce_secure.
-- ============================================================

USE `e_commerce_secure`;

CREATE TABLE IF NOT EXISTS security_audit_log (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    event_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    table_name  VARCHAR(50)  NOT NULL,
    operation   VARCHAR(30)  NOT NULL,
    ip          VARCHAR(45)  DEFAULT NULL,
    payload     TEXT         DEFAULT NULL,
    reason      VARCHAR(255) DEFAULT NULL,
    affected_id INT          DEFAULT NULL,
    old_value   TEXT         DEFAULT NULL,
    new_value   TEXT         DEFAULT NULL,
    notes       TEXT         DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hard-reject log: MyISAM is intentionally non-transactional so a rejected
-- write can still leave evidence even when the triggering INSERT/UPDATE fails.
CREATE TABLE IF NOT EXISTS security_reject_log (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    event_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    table_name  VARCHAR(50)  NOT NULL,
    operation   VARCHAR(30)  NOT NULL,
    payload     TEXT         DEFAULT NULL,
    reason      VARCHAR(255) DEFAULT NULL,
    notes       TEXT         DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PHẦN 3: VIEWS
-- Giới hạn cột có thể truy cập — Union-based SQLi không lấy được password
-- ============================================================

-- View: accounts public data masking
-- Giữ nguyên việc không expose password/password_hash/token.
-- Bổ sung che một phần email để giảm thiệt hại nếu dữ liệu public bị đọc lộ.