-- Fix trigger để match schema thực tế của security_audit_log
-- Schema: id, event_time, table_name, operation, affected_id, old_value, new_value, notes, ip, payload, reason

USE e_commerce_secure;

DROP TRIGGER IF EXISTS trg_sqli_detect_secure;

DELIMITER $$
CREATE TRIGGER trg_sqli_detect_secure
BEFORE INSERT ON comments
FOR EACH ROW
BEGIN
  IF NEW.content REGEXP 'union[[:space:]]+select|select[[:space:]].*from|information_schema|--|;[[:space:]]*drop[[:space:]]+table' THEN
    INSERT INTO security_audit_log(db_name, table_name, operation, notes, severity, ip, payload, reason)
    VALUES(
      'e_commerce_secure',
      'comments',
      'SQLI_ATTEMPT',
      CONCAT('SQLi in comment content: ', LEFT(NEW.content, 200)),
      CASE
        WHEN NEW.content REGEXP 'union[[:space:]]+select|information_schema|;[[:space:]]*drop[[:space:]]+table' THEN 'CRITICAL'
        WHEN NEW.content REGEXP 'select[[:space:]].*from' THEN 'MEDIUM'
        ELSE 'LOW'
      END,
      'unknown',
      NEW.content,
      'SQLi pattern detected'
    );
  END IF;
END$$
DELIMITER ;

USE e_commerce_vulnerable;

DROP TRIGGER IF EXISTS trg_sqli_detect_vuln;

DELIMITER $$
CREATE TRIGGER trg_sqli_detect_vuln
BEFORE INSERT ON comments
FOR EACH ROW
BEGIN
  IF NEW.content REGEXP 'union[[:space:]]+select|select[[:space:]].*from|information_schema|--|;[[:space:]]*drop[[:space:]]+table' THEN
    INSERT INTO security_audit_log(db_name, table_name, operation, notes, severity, ip, payload, reason)
    VALUES(
      'e_commerce_vulnerable',
      'comments',
      'SQLI_ATTEMPT',
      CONCAT('SQLi in comment content: ', LEFT(NEW.content, 200)),
      CASE
        WHEN NEW.content REGEXP 'union[[:space:]]+select|information_schema|;[[:space:]]*drop[[:space:]]+table' THEN 'CRITICAL'
        WHEN NEW.content REGEXP 'select[[:space:]].*from' THEN 'MEDIUM'
        ELSE 'LOW'
      END,
      'unknown',
      NEW.content,
      'SQLi pattern detected'
    );
  END IF;
END$$
DELIMITER ;
