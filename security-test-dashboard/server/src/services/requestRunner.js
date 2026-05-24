import { config } from "../config.js";
import { payloads } from "../data/payloads.js";
import { testCases } from "../data/testCases.js";
import { resolvePayloadSelection } from "./customPayload.js";
import { buildSnippet, extractRecordCount, tryParseJson } from "./responseParser.js";
import { classifyResultDetailed, isExpectedResult } from "./testClassifier.js";
import { buildTestUrl } from "./urlBuilder.js";

function findTestCase(testId) {
  const testCase = testCases.find((item) => item.id === testId);
  if (!testCase) {
    throw new Error(`Unknown test case: ${testId}`);
  }
  return testCase;
}

function findTarget(targetKey) {
  const target = config.targets[targetKey];
  if (!target) {
    throw new Error(`Unknown target: ${targetKey}`);
  }
  return target;
}

function buildPostBody(testCase, payload) {
  if (testCase.id === "TC-07") {
    return {
      userId: 1,
      productId: 1,
      star: 5,
      content: payload,
    };
  }

  return payload;
}

async function executeRequest({ testCase, target, payload }) {
  const url = buildTestUrl(target, testCase, payload);
  const timeoutMs = testCase.timeoutMs ?? config.testTimeoutMs;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      method: testCase.method,
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/json",
      },
      body: testCase.method === "POST" ? JSON.stringify(buildPostBody(testCase, payload)) : undefined,
      signal: controller.signal,
    });
    const body = await response.text();
    const parsedBody = tryParseJson(body);

    return {
      url,
      statusCode: response.status,
      body,
      responseTimeMs: Date.now() - startedAt,
      recordCount: extractRecordCount(parsedBody),
      timedOut: false,
    };
  } catch (error) {
    const timedOut = error.name === "AbortError";

    return {
      url,
      statusCode: null,
      body: timedOut ? "Request timed out" : (error.message ?? "Request failed"),
      responseTimeMs: Date.now() - startedAt,
      recordCount: 0,
      timedOut,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function toBaselineSnapshot(requestResult) {
  return {
    statusCode: requestResult.statusCode,
    responseTimeMs: requestResult.responseTimeMs,
    recordCount: requestResult.recordCount,
    timedOut: requestResult.timedOut,
  };
}

async function collectBaseline(targetKey) {
  const baselineTestCase = findTestCase("TC-00");
  const target = findTarget(targetKey);
  const baselinePayload = payloads[baselineTestCase.payloadGroup]?.[0];

  if (!baselinePayload) {
    return null;
  }

  const requestResult = await executeRequest({
    testCase: baselineTestCase,
    target,
    payload: baselinePayload,
  });

  return toBaselineSnapshot(requestResult);
}

async function resolveBaseline({ testCase, targetKey, baseline }) {
  if (testCase.payloadGroup === "normal") {
    return null;
  }

  if (baseline !== undefined) {
    return baseline;
  }

  return collectBaseline(targetKey);
}

export async function runTest({ testId, targetKey, payload, baseline }) {
  const testCase = findTestCase(testId);
  const target = findTarget(targetKey);
  const payloadSelection = resolvePayloadSelection({
    testCase,
    payloadMap: payloads,
    customPayload: payload,
  });
  const selectedPayload = payloadSelection.payload;

  const requestResult = await executeRequest({
    testCase,
    target,
    payload: selectedPayload,
  });
  const resolvedBaseline = await resolveBaseline({
    testCase,
    targetKey,
    baseline,
  });
  const detailedClassification = classifyResultDetailed({
    testCase,
    targetKey,
    statusCode: requestResult.statusCode,
    body: requestResult.body,
    responseTimeMs: requestResult.responseTimeMs,
    recordCount: requestResult.recordCount,
    timedOut: requestResult.timedOut,
    baseline: resolvedBaseline,
  });
  const passed = isExpectedResult({
    testCase,
    targetKey,
    classification: detailedClassification.classification,
  });

  return {
    id: testCase.id,
    name: testCase.name,
    target: targetKey,
    targetLabel: target.label,
    method: testCase.method,
    url: requestResult.url,
    payload: selectedPayload,
    payloadSource: payloadSelection.payloadSource,
    payloadWarning: payloadSelection.payloadWarning,
    statusCode: requestResult.statusCode,
    responseTimeMs: requestResult.responseTimeMs,
    recordCount: requestResult.recordCount,
    classification: detailedClassification.classification,
    classificationReason: detailedClassification.reason,
    severity: detailedClassification.severity,
    baseline: resolvedBaseline,
    expected: testCase.expected,
    passed,
    timedOut: requestResult.timedOut,
    responseSnippet: buildSnippet(requestResult.body),
    createdAt: new Date().toISOString(),
  };
}

export async function runTestAcrossTargets({ testId, targetKeys, payload }) {
  const testCase = findTestCase(testId);
  const selectedTargets = targetKeys?.length ? targetKeys : testCase.targetKeys;
  const results = [];

  for (const currentTargetKey of selectedTargets) {
    results.push(await runTest({
      testId,
      targetKey: currentTargetKey,
      payload,
    }));
  }

  return results;
}

export async function runAllTests({ targetKeys } = {}) {
  const results = [];
  const baselineByTarget = new Map();

  for (const testCase of testCases) {
    const selectedTargets = targetKeys?.length
      ? testCase.targetKeys.filter((key) => targetKeys.includes(key))
      : testCase.targetKeys;

    for (const targetKey of selectedTargets) {
      if (!baselineByTarget.has(targetKey)) {
        baselineByTarget.set(targetKey, await collectBaseline(targetKey));
      }

      results.push(await runTest({
        testId: testCase.id,
        targetKey,
        baseline: baselineByTarget.get(targetKey),
      }));
    }
  }

  return results;
}
