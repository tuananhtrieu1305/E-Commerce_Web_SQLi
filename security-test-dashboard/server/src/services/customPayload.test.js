import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_CUSTOM_PAYLOAD_LENGTH,
  resolvePayloadSelection,
} from "./customPayload.js";

const payloadMap = {
  timeBased: ["%' AND IF(1=1,SLEEP(2),0) --"],
};

const timeBasedTestCase = {
  id: "TC-04",
  payloadGroup: "timeBased",
};

describe("resolvePayloadSelection", () => {
  it("uses the configured payload when no custom payload is provided", () => {
    const result = resolvePayloadSelection({
      testCase: timeBasedTestCase,
      payloadMap,
    });

    assert.equal(result.payload, payloadMap.timeBased[0]);
    assert.equal(result.payloadSource, "DEFAULT");
    assert.equal(result.payloadWarning, null);
  });

  it("preserves custom payload whitespace and marks it as custom", () => {
    const customPayload = "%' OR 1=1 -- ";

    const result = resolvePayloadSelection({
      testCase: timeBasedTestCase,
      payloadMap,
      customPayload,
    });

    assert.equal(result.payload, customPayload);
    assert.equal(result.payloadSource, "CUSTOM");
  });

  it("rejects empty custom payloads", () => {
    assert.throws(
      () => resolvePayloadSelection({
        testCase: timeBasedTestCase,
        payloadMap,
        customPayload: "   ",
      }),
      /payload cannot be empty/i,
    );
  });

  it("rejects oversized custom payloads", () => {
    assert.throws(
      () => resolvePayloadSelection({
        testCase: timeBasedTestCase,
        payloadMap,
        customPayload: "x".repeat(MAX_CUSTOM_PAYLOAD_LENGTH + 1),
      }),
      /payload is too long/i,
    );
  });

  it("warns when the custom payload does not match the test case family", () => {
    const result = resolvePayloadSelection({
      testCase: timeBasedTestCase,
      payloadMap,
      customPayload: "iPhone",
    });

    assert.match(result.payloadWarning, /time-based/i);
  });
});
