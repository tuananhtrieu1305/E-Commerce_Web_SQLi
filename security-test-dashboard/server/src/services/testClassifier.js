const SQL_ERROR_PATTERNS = [
  /sql syntax/i,
  /jdbc/i,
  /hibernate/i,
  /mysql/i,
  /xpat[h]? syntax/i,
  /unknown column/i,
  /class java\./i,
];

const MALICIOUS_GROUPS = new Set([
  "booleanBased",
  "unionBased",
  "errorBased",
  "timeBased",
  "orderBy",
  "secondOrder",
]);

function hasSqlError(body) {
  return SQL_ERROR_PATTERNS.some((pattern) => pattern.test(body ?? ""));
}

function isTimeSensitive(testCase) {
  return testCase.payloadGroup === "timeBased" || testCase.payloadGroup === "orderBy";
}

function hasSensitiveLeak(body) {
  return /"password"|password_hash|reset_token|'leak'|"leak"|username.*password/i.test(body ?? "");
}

function isSuccessful(statusCode) {
  return statusCode >= 200 && statusCode < 300;
}

function slowThresholdFromBaseline(baseline) {
  if (!baseline?.responseTimeMs) {
    return 2000;
  }
  return Math.max(2000, baseline.responseTimeMs * 4, baseline.responseTimeMs + 1500);
}

function hasAbnormalRecordCount(recordCount, baseline) {
  if (!baseline || !Number.isFinite(recordCount) || !Number.isFinite(baseline.recordCount)) {
    return false;
  }

  return recordCount > Math.max(baseline.recordCount + 5, baseline.recordCount * 2);
}

function detail(classification, reason, severity = "info") {
  return {
    classification,
    reason,
    severity,
  };
}

export function classifyResultDetailed({
  testCase,
  targetKey,
  statusCode,
  body,
  responseTimeMs,
  recordCount = 0,
  timedOut,
  baseline,
}) {
  if (timedOut && isTimeSensitive(testCase)) {
    return detail(
      "TIME_BASED_VULNERABLE",
      "Time-sensitive payload exceeded the runner timeout, which is consistent with time-based SQLi.",
      "danger",
    );
  }

  if (timedOut) {
    return detail("REQUEST_TIMEOUT", "Request timed out before an HTTP response was received.", "warning");
  }

  if (statusCode === null || statusCode === undefined) {
    return detail(
      "TEST_INFRA_ERROR",
      "The request did not reach the target or no HTTP status was returned.",
      "warning",
    );
  }

  if (/\[DB SECURITY\]/i.test(body ?? "")) {
    return detail("DB_HARD_REJECTED", "Database trigger rejected the payload with a DB SECURITY error.", "success");
  }

  if (statusCode === 403) {
    return detail("WAF_BLOCKED", "Request was blocked with HTTP 403 before normal application handling.", "success");
  }

  if (statusCode === 400) {
    return detail("VALIDATION_BLOCKED", "Request was rejected by validation with HTTP 400.", "success");
  }

  if (statusCode >= 500 && hasSqlError(body)) {
    return detail("SQL_ERROR_LEAKED", "Response exposed SQL/JDBC/Hibernate/MySQL error details.", "danger");
  }

  if (statusCode >= 500) {
    return detail("SERVER_ERROR", "Target returned a server error without a clear SQL error signature.", "warning");
  }

  if (isSuccessful(statusCode) && isTimeSensitive(testCase)) {
    const threshold = slowThresholdFromBaseline(baseline);
    if (responseTimeMs > threshold) {
      return detail(
        "TIME_BASED_VULNERABLE",
        `Response time ${responseTimeMs} ms exceeded baseline-aware threshold ${Math.round(threshold)} ms.`,
        "danger",
      );
    }
  }

  if (isSuccessful(statusCode) && testCase.payloadGroup === "normal") {
    return detail("SAFE_NORMAL", "Normal request returned a successful response.", "success");
  }

  if (isSuccessful(statusCode) && hasSensitiveLeak(body)) {
    return detail("DATA_LEAK", "Response contains sensitive data indicators such as password/token/leak markers.", "danger");
  }

  if (isSuccessful(statusCode) && MALICIOUS_GROUPS.has(testCase.payloadGroup)) {
    if (hasAbnormalRecordCount(recordCount, baseline)) {
      return detail(
        "POSSIBLE_SQLI",
        `Record count ${recordCount} is abnormal compared with baseline ${baseline.recordCount}.`,
        targetKey === "vulnerable" ? "danger" : "warning",
      );
    }

    if (targetKey === "vulnerable") {
      return detail(
        "POSSIBLE_SQLI",
        "Malicious payload reached the vulnerable target; review response body for exploitation evidence.",
        "warning",
      );
    }

    return detail(
      "SAFE_HANDLED",
      "Payload returned HTTP 2xx but no abnormal data, SQL error, sensitive leak, or timing anomaly was detected.",
      "success",
    );
  }

  return detail("UNKNOWN", "No classifier rule matched this response.", "warning");
}

export function classifyResult(args) {
  return classifyResultDetailed(args).classification;
}

export function isExpectedResult({ testCase, targetKey, classification }) {
  if (testCase.payloadGroup === "normal") {
    return classification === "SAFE_NORMAL";
  }

  if (targetKey === "vulnerable") {
    return [
      "POSSIBLE_SQLI",
      "SQL_ERROR_LEAKED",
      "DATA_LEAK",
      "TIME_BASED_VULNERABLE",
      "REQUEST_TIMEOUT",
      "SERVER_ERROR",
    ].includes(classification);
  }

  return [
    "WAF_BLOCKED",
    "VALIDATION_BLOCKED",
    "SAFE_HANDLED",
    "DB_HARD_REJECTED",
  ].includes(classification);
}
