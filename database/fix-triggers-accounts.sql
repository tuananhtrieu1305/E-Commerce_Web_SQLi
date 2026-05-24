-- Thêm trigger bắt SQLi ở bảng accounts (áp dụng cho Username)
USE e_commerce_secure;

DROP TRIGGER IF EXISTS trg_sqli_detect_account_secure;
DELIMITER $$
CREATE TRIGGER trg_sqli_detect_account_secure
BEFORE INSERT ON accounts
FOR EACH ROW
BEGIN
  IF NEW.username REGEXP 'union[[:space:]]+select|select[[:space:]].*from|information_schema|--|;[[:space:]]*drop[[:space:]]+table' THEN
    INSERT INTO security_audit_log(db_name, table_name, operation, notes, severity, ip, payload, reason)
    VALUES(
      'e_commerce_secure',
      'accounts',
      'SQLI_ATTEMPT',
      CONCAT('SQLi in username: ', LEFT(NEW.username, 200)),
      CASE
        WHEN NEW.username REGEXP 'union[[:space:]]+select|information_schema|;[[:space:]]*drop[[:space:]]+table' THEN 'CRITICAL'
        WHEN NEW.username REGEXP 'select[[:space:]].*from' THEN 'MEDIUM'
        ELSE 'LOW'
      END,
      'unknown',
      NEW.username,
      'SQLi pattern detected'
    );
  END IF;
END$$
DELIMITER ;

USE e_commerce_vulnerable;

DROP TRIGGER IF EXISTS trg_sqli_detect_account_vuln;
DELIMITER $$
CREATE TRIGGER trg_sqli_detect_account_vuln
BEFORE INSERT ON accounts
FOR EACH ROW
BEGIN
  IF NEW.username REGEXP 'union[[:space:]]+select|select[[:space:]].*from|information_schema|--|;[[:space:]]*drop[[:space:]]+table' THEN
    INSERT INTO security_audit_log(db_name, table_name, operation, notes, severity, ip, payload, reason)
    VALUES(
      'e_commerce_vulnerable',
      'accounts',
      'SQLI_ATTEMPT',
      CONCAT('SQLi in username: ', LEFT(NEW.username, 200)),
      CASE
        WHEN NEW.username REGEXP 'union[[:space:]]+select|information_schema|;[[:space:]]*drop[[:space:]]+table' THEN 'CRITICAL'
        WHEN NEW.username REGEXP 'select[[:space:]].*from' THEN 'MEDIUM'
        ELSE 'LOW'
      END,
      'unknown',
      NEW.username,
      'SQLi pattern detected'
    );
  END IF;
END$$
DELIMITER ;
