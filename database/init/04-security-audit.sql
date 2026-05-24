-- Create security_audit_log in both vulnerable and secure DBs and add simple triggers

-- Create table in vulnerable DB
CREATE DATABASE IF NOT EXISTS `e_commerce_vulnerable`;
USE `e_commerce_vulnerable`;

CREATE TABLE IF NOT EXISTS security_audit_log (
  id INT NOT NULL AUTO_INCREMENT,
  event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  db_name VARCHAR(128),
  table_name VARCHAR(128),
  operation VARCHAR(30),
  affected_id INT DEFAULT NULL,
  old_value TEXT DEFAULT NULL,
  new_value TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  severity ENUM('LOW', 'MEDIUM', 'CRITICAL') NOT NULL DEFAULT 'LOW',
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
    INSERT INTO security_audit_log(db_name, table_name, operation, notes, severity, ip, payload, reason)
    VALUES(
      'e_commerce_vulnerable',
      'comments',
      'SQLI_ATTEMPT',
      CONCAT('SQLi in comment content: ', LEFT(NEW.content, 200)),
      CASE
        WHEN NEW.content REGEXP 'union[[:space:]]+select|information_schema|;[[:space:]]*drop[[:space:]]+table' THEN 'CRITICAL'
        WHEN NEW.content REGEXP 'select[[:space:]].*from|delete[[:space:]]+from|update[[:space:]].*set' THEN 'MEDIUM'
        ELSE 'LOW'
      END,
      'unknown',
      NEW.content,
      'pattern match'
    );
  END IF;
END$$
DELIMITER ;

-- Repeat in secure DB
CREATE DATABASE IF NOT EXISTS `e_commerce_secure`;
USE `e_commerce_secure`;

CREATE TABLE IF NOT EXISTS security_audit_log (
  id INT NOT NULL AUTO_INCREMENT,
  event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  db_name VARCHAR(128),
  table_name VARCHAR(128),
  operation VARCHAR(30),
  affected_id INT DEFAULT NULL,
  old_value TEXT DEFAULT NULL,
  new_value TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  severity ENUM('LOW', 'MEDIUM', 'CRITICAL') NOT NULL DEFAULT 'LOW',
  ip VARCHAR(64),
  payload TEXT,
  reason VARCHAR(255),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_security_audit_comments_before_insert_secure
BEFORE INSERT ON comments
FOR EACH ROW
BEGIN
  IF NEW.content REGEXP 'union[[:space:]]+select|select[[:space:]].*from|information_schema|update[[:space:]].*set|delete[[:space:]]+from|--|;[[:space:]]*drop[[:space:]]+table' THEN
    INSERT INTO security_audit_log(db_name, table_name, operation, notes, severity, ip, payload, reason)
    VALUES(
      'e_commerce_secure',
      'comments',
      'SQLI_ATTEMPT',
      CONCAT('SQLi in comment content: ', LEFT(NEW.content, 200)),
      CASE
        WHEN NEW.content REGEXP 'union[[:space:]]+select|information_schema|;[[:space:]]*drop[[:space:]]+table' THEN 'CRITICAL'
        WHEN NEW.content REGEXP 'select[[:space:]].*from|delete[[:space:]]+from|update[[:space:]].*set' THEN 'MEDIUM'
        ELSE 'LOW'
      END,
      'unknown',
      NEW.content,
      'pattern match'
    );
  END IF;
END$$
DELIMITER ;

-- Note: Triggers set ip='unknown' because application-provided IP is not available here.
