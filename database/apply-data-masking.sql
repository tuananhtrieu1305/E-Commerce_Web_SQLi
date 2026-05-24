-- ============================================================
-- Apply DB-side Data Masking customizations to an existing DB.
-- Safe scope:
--   1. Update existing v_accounts_public to mask email.
--   2. Recreate sp_get_account_safe so it reads from v_accounts_public.
--   3. Add demo-only masked_reader user with SELECT only on the View.
--
-- This script does not revoke app_secure permissions because current backend
-- still reads base tables in several normal flows.
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

DROP PROCEDURE IF EXISTS sp_get_account_safe;

DELIMITER $$

CREATE PROCEDURE sp_get_account_safe(
    IN p_username VARCHAR(255)
)
BEGIN
    SET @p_uname = p_username;
    PREPARE stmt FROM
        'SELECT id, username, email, role, created_at, deleted
         FROM v_accounts_public
         WHERE username = ? AND deleted = 0';
    EXECUTE stmt USING @p_uname;
    DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;

CREATE USER IF NOT EXISTS 'masked_reader'@'%' IDENTIFIED BY 'MaskedReader@2024';
GRANT SELECT ON `e_commerce_secure`.`v_accounts_public` TO 'masked_reader'@'%';
FLUSH PRIVILEGES;

SHOW GRANTS FOR 'masked_reader'@'%';
