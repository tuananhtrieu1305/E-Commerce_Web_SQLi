import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyResultDetailed } from "./testClassifier.js";

const normalTest = {
  id: "TC-00",
  payloadGroup: "normal",
};

const booleanTest = {
  id: "TC-01",
  payloadGroup: "booleanBased",
};

const timeTest = {
  id: "TC-04",
  payloadGroup: "timeBased",
};

describe("classifyResultDetailed", () => {
  it("classifies network failures as test infrastructure errors", () => {
    const result = classifyResultDetailed({
      testCase: normalTest,
      targetKey: "secure",
      statusCode: null,
      body: "Connection refused",
      responseTimeMs: 31,
      recordCount: 0,
      timedOut: false,
    });

    assert.equal(result.classification, "TEST_INFRA_ERROR");
    assert.match(result.reason, /request did not reach/i);
  });

  it("uses baseline timing when detecting time-based SQL injection", () => {
    const result = classifyResultDetailed({
      testCase: timeTest,
      targetKey: "vulnerable",
      statusCode: 200,
      body: "{\"status\":200,\"data\":[]}",
      responseTimeMs: 6400,
      recordCount: 0,
      timedOut: false,
      baseline: {
        responseTimeMs: 120,
        recordCount: 1,
      },
    });

    assert.equal(result.classification, "TIME_BASED_VULNERABLE");
    assert.match(result.reason, /baseline/i);
  });

  it("does not mark every 200 response to malicious input as vulnerable", () => {
    const result = classifyResultDetailed({
      testCase: booleanTest,
      targetKey: "secure",
      statusCode: 200,
      body: "{\"status\":200,\"data\":[]}",
      responseTimeMs: 80,
      recordCount: 0,
      timedOut: false,
      baseline: {
        responseTimeMs: 75,
        recordCount: 1,
      },
    });

    assert.equal(result.classification, "SAFE_HANDLED");
    assert.match(result.reason, /no abnormal/i);
  });

  it("detects SQL error disclosure", () => {
    const result = classifyResultDetailed({
      testCase: booleanTest,
      targetKey: "vulnerable",
      statusCode: 500,
      body: "JDBC exception executing SQL [SELECT * FROM products]",
      responseTimeMs: 44,
      recordCount: 0,
      timedOut: false,
    });

    assert.equal(result.classification, "SQL_ERROR_LEAKED");
    assert.match(result.reason, /sql/i);
  });
});
