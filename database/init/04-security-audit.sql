-- Create security_audit_log in both vulnerable and secure DBs and add simple triggers

-- Create table in vulnerable DB
CREATE DATABASE IF NOT EXISTS `e_commerce_vulnerable`;
USE `e_commerce_vulnerable`;

CREATE TABLE IF NOT EXISTS security_audit_log (
  id INT NOT NULL AUTO_INCREMENT,
  event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  db_name VARCHAR(128),
  table_name VARCHAR(128),
  ip VARCHAR(64),
  payload TEXT,
  reason VARCHAR(255),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trigger on comments table to detect simple SQLi patterns
DELIMITER $$
CREATE TRIGGER trg_security_audit_comments_before_insert
BEFORE INSERT ON comments
FOR EACH ROW
BEGIN
  IF NEW.content REGEXP 'union[[:space:]]+select|select[[:space:]].*from|information_schema|update[[:space:]].*set|delete[[:space:]]+from|--|;[[:space:]]*drop[[:space:]]+table' THEN
    INSERT INTO security_audit_log(db_name, table_name, ip, payload, reason)
    VALUES('e_commerce_vulnerable','comments','unknown', NEW.content, 'pattern match');
  END IF;
END$$
DELIMITER ;

-- Repeat table compatibility in secure DB.
-- The secure DB now uses DB hard-reject triggers from 02-secure-objects.sql.
-- Do not create the legacy comment audit trigger here because the secure audit
-- table has a different schema and the duplicate trigger can fail before the
-- hard-reject trigger returns the intended DB security error.
CREATE DATABASE IF NOT EXISTS `e_commerce_secure`;
USE `e_commerce_secure`;

CREATE TABLE IF NOT EXISTS security_audit_log (
  id INT NOT NULL AUTO_INCREMENT,
  event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  db_name VARCHAR(128),
  table_name VARCHAR(128),
  ip VARCHAR(64),
  payload TEXT,
  reason VARCHAR(255),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TRIGGER IF EXISTS trg_security_audit_comments_before_insert_secure;

-- Note: Triggers set ip='unknown' because application-provided IP is not available here.
