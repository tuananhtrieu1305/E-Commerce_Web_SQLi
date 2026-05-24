import mysql from "mysql2/promise";
import { config } from "../config.js";

const dbChecks = {
  "masking-view": {
    id: "masking-view",
    name: "Masked account view",
    purpose: "Verify v_accounts_public hides password and masks email.",
  },
  "safe-stored-procedure": {
    id: "safe-stored-procedure",
    name: "Safe account stored procedure",
    purpose: "Verify sp_get_account_safe returns only public account fields.",
  },
  "least-privilege": {
    id: "least-privilege",
    name: "Masked reader least privilege",
    purpose: "Verify masked_reader can read the view but cannot read accounts directly.",
  },
  "regex-function": {
    id: "regex-function",
    name: "SQLi regex detector",
    purpose: "Verify fn_is_sqli_payload detects malicious strings and allows normal text.",
  },
  "hard-reject-trigger": {
    id: "hard-reject-trigger",
    name: "DB hard-reject trigger",
    purpose: "Verify malicious persisted content is rejected and logged.",
  },
};

function createConnection({ user, password }) {
  return mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user,
    password,
    database: config.db.database,
    timezone: "Z",
    multipleStatements: false,
  });
}

async function withConnection(credentials, operation) {
  const connection = await createConnection(credentials);
  try {
    return await operation(connection);
  } finally {
    await connection.end();
  }
}

function adminCredentials() {
  return {
    user: config.db.adminUser,
    password: config.db.adminPassword,
  };
}

function maskedReaderCredentials() {
  return {
    user: config.db.maskedReaderUser,
    password: config.db.maskedReaderPassword,
  };
}

function normalizeError(error) {
  return {
    code: error?.code ?? "UNKNOWN",
    errno: error?.errno ?? null,
    sqlState: error?.sqlState ?? null,
    message: error?.message ?? "Database operation failed",
  };
}

function toResult({ check, classification, passed, reason, rows = [], details = {} }) {
  return {
    id: check.id,
    name: check.name,
    purpose: check.purpose,
    classification,
    passed,
    reason,
    rows,
    details,
    createdAt: new Date().toISOString(),
  };
}

function hasSensitiveColumn(row) {
  return Object.keys(row ?? {}).some((key) => /password|token|secret/i.test(key));
}

function isMaskedEmail(email) {
  return typeof email === "string" && email.includes("***") && !email.includes("admin@gmail.com");
}

async function runMaskingViewCheck(check) {
  const rows = await withConnection(adminCredentials(), async (connection) => {
    const [result] = await connection.execute(
      "SELECT id, username, email, role, created_at, deleted FROM v_accounts_public WHERE username = ? LIMIT 1",
      ["admin"],
    );
    return result;
  });
  const row = rows[0] ?? null;
  const passed = Boolean(row) && isMaskedEmail(row.email) && !hasSensitiveColumn(row);

  return toResult({
    check,
    classification: passed ? "MASKED_VIEW_OK" : "DATA_EXPOSED",
    passed,
    reason: passed
      ? "View returns public fields only and email is masked."
      : "View did not return a masked public account shape.",
    rows,
    details: {
      columns: Object.keys(row ?? {}),
    },
  });
}

async function runSafeStoredProcedureCheck(check) {
  const rows = await withConnection(adminCredentials(), async (connection) => {
    const [resultSets] = await connection.execute("CALL sp_get_account_safe(?)", ["admin"]);
    return resultSets[0] ?? [];
  });
  const row = rows[0] ?? null;
  const passed = Boolean(row) && isMaskedEmail(row.email) && !hasSensitiveColumn(row);

  return toResult({
    check,
    classification: passed ? "SP_SAFE_OK" : "DATA_EXPOSED",
    passed,
    reason: passed
      ? "Stored procedure returns masked public account data."
      : "Stored procedure returned unexpected sensitive or unmasked data.",
    rows,
    details: {
      columns: Object.keys(row ?? {}),
    },
  });
}

async function runLeastPrivilegeCheck(check) {
  return withConnection(maskedReaderCredentials(), async (connection) => {
    const [viewRows] = await connection.execute(
      "SELECT id, username, email, role FROM v_accounts_public WHERE username = ? LIMIT 1",
      ["admin"],
    );
    let directReadError = null;

    try {
      await connection.execute("SELECT password FROM accounts LIMIT 1");
    } catch (error) {
      directReadError = normalizeError(error);
    }

    const viewWorks = viewRows.length > 0;
    const directReadDenied = Boolean(directReadError) && /denied|access/i.test(directReadError.message);
    const passed = viewWorks && directReadDenied;

    return toResult({
      check,
      classification: passed ? "LEAST_PRIVILEGE_OK" : "PRIVILEGE_TOO_BROAD",
      passed,
      reason: passed
        ? "masked_reader can read the masked view but direct table access is denied."
        : "masked_reader permissions do not enforce the expected view boundary.",
      rows: viewRows,
      details: {
        directReadDenied,
        directReadError,
      },
    });
  });
}

async function runRegexFunctionCheck(check) {
  const rows = await withConnection(adminCredentials(), async (connection) => {
    const [result] = await connection.execute(
      "SELECT fn_is_sqli_payload(?) AS normal_detected, fn_is_sqli_payload(?) AS attack_detected",
      ["Nice product", "%' UNION SELECT password FROM accounts -- "],
    );
    return result;
  });
  const row = rows[0] ?? {};
  const passed = Number(row.normal_detected) === 0 && Number(row.attack_detected) === 1;

  return toResult({
    check,
    classification: passed ? "REGEX_DETECTOR_OK" : "REGEX_DETECTOR_FAILED",
    passed,
    reason: passed
      ? "DB regex helper allows normal text and flags SQLi-like payloads."
      : "DB regex helper did not classify normal/attack payloads as expected.",
    rows,
  });
}

async function runHardRejectTriggerCheck(check) {
  const payload = `dashboard-test UNION SELECT password FROM accounts -- ${Date.now()}`;

  return withConnection(adminCredentials(), async (connection) => {
    await connection.beginTransaction();
    let insertSucceeded = false;
    let rejectionError = null;

    try {
      await connection.execute(
        "INSERT INTO comments (user_id, prod_id, star, content) VALUES (?, ?, ?, ?)",
        [1, 1, 5, payload],
      );
      insertSucceeded = true;
      await connection.rollback();
    } catch (error) {
      rejectionError = normalizeError(error);
      try {
        await connection.rollback();
      } catch {
        // The rejected write can fail before rollback is needed.
      }
    }

    const [rejectRows] = await connection.execute(
      "SELECT id, event_time, table_name, operation, payload, reason, notes FROM security_reject_log WHERE payload = ? ORDER BY id DESC LIMIT 1",
      [payload],
    );
    const rejected = !insertSucceeded && /DB SECURITY|Suspicious SQL payload|SQLI/i.test(rejectionError?.message ?? "");
    const passed = rejected && rejectRows.length > 0;

    return toResult({
      check,
      classification: passed ? "DB_HARD_REJECTED" : "DB_REJECT_MISSED",
      passed,
      reason: passed
        ? "Trigger rejected persisted SQLi-like content and wrote reject-log evidence."
        : "Malicious persisted content was not rejected and logged as expected.",
      rows: rejectRows,
      details: {
        insertSucceeded,
        rejectionError,
      },
    });
  });
}

const checkHandlers = {
  "masking-view": runMaskingViewCheck,
  "safe-stored-procedure": runSafeStoredProcedureCheck,
  "least-privilege": runLeastPrivilegeCheck,
  "regex-function": runRegexFunctionCheck,
  "hard-reject-trigger": runHardRejectTriggerCheck,
};

export function listDbChecks() {
  return Object.values(dbChecks);
}

export async function runDbCheck(checkId) {
  const check = dbChecks[checkId];
  const handler = checkHandlers[checkId];

  if (!check || !handler) {
    throw new Error(`Unknown database check: ${checkId}`);
  }

  try {
    return await handler(check);
  } catch (error) {
    return toResult({
      check,
      classification: "TEST_INFRA_ERROR",
      passed: false,
      reason: "Database check could not run. Verify MySQL container, port, and credentials.",
      details: {
        error: normalizeError(error),
      },
    });
  }
}

export async function runAllDbChecks() {
  const results = [];

  for (const check of Object.values(dbChecks)) {
    results.push(await runDbCheck(check.id));
  }

  return results;
}

function normalizeLimit(limit) {
  return Math.min(Math.max(Number(limit) || 20, 1), 100);
}

export async function getAuditLog(limit = 20) {
  return withConnection(adminCredentials(), async (connection) => {
    const [rows] = await connection.query(
      "SELECT * FROM security_audit_log ORDER BY id DESC LIMIT ?",
      [normalizeLimit(limit)],
    );
    return rows;
  });
}

export async function getRejectLog(limit = 20) {
  return withConnection(adminCredentials(), async (connection) => {
    const [rows] = await connection.query(
      "SELECT id, event_time, table_name, operation, payload, reason, notes FROM security_reject_log ORDER BY id DESC LIMIT ?",
      [normalizeLimit(limit)],
    );
    return rows;
  });
}
