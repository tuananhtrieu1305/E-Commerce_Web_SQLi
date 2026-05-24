-- ============================================================
-- 02d-security-functions.sql
-- Shared DB security helper functions.
-- ============================================================

USE `e_commerce_secure`;

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

DELIMITER ;
