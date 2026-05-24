-- ============================================================
-- 03-users.sql
-- Tạo user app_secure với least privilege trên e_commerce_secure
-- Thêm EXECUTE để backend-secure có thể gọi Stored Procedures
-- ============================================================

-- User cho backend-secure: chỉ SELECT, INSERT, UPDATE và EXECUTE
CREATE USER IF NOT EXISTS 'app_secure'@'%' IDENTIFIED BY 'SecurePass@2024';

GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.* TO 'app_secure'@'%';
GRANT EXECUTE ON `e_commerce_secure`.* TO 'app_secure'@'%';

-- KHÔNG CÓ: DROP, DELETE, ALTER, CREATE, TRUNCATE, GRANT

-- Demo-only masked reader:
-- Dùng để chứng minh Security View là boundary đọc dữ liệu an toàn.
-- User này chỉ đọc được v_accounts_public, không đọc trực tiếp được bảng accounts.
CREATE USER IF NOT EXISTS 'masked_reader'@'%' IDENTIFIED BY 'MaskedReader@2024';
GRANT SELECT ON `e_commerce_secure`.`v_accounts_public` TO 'masked_reader'@'%';

FLUSH PRIVILEGES;

-- Verification
SHOW GRANTS FOR 'app_secure'@'%';
SHOW GRANTS FOR 'masked_reader'@'%';
