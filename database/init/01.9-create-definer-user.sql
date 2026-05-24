-- ============================================================
-- 01.9-create-definer-user.sql
-- Pre-requisite: Create sp_definer BEFORE 02-secure-objects.sql
-- and 02.5-updatable-views.sql reference it as DEFINER.
-- ============================================================

-- Must run as root (which it does during Docker init)
CREATE USER IF NOT EXISTS 'sp_definer'@'%' IDENTIFIED BY 'DefinerPass@2024';
GRANT ALL PRIVILEGES ON `e_commerce_secure`.* TO 'sp_definer'@'%';
FLUSH PRIVILEGES;
