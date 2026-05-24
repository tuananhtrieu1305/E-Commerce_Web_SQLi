import { config } from "../config.js";
import { buildSnippet, tryParseJson } from "./responseParser.js";
import { readContainerLogs } from "./dockerLogService.js";
import { parseWafLog } from "./wafLogParser.js";

const wafScenarios = {
  "normal-search": {
    id: "normal-search",
    name: "Normal product search",
    purpose: "False positive check",
    method: "GET",
    path: "/api/product",
    query: { title: "iPhone" },
    expected: "ALLOW",
  },
  "boolean-sqli": {
    id: "boolean-sqli",
    name: "Boolean-based SQLi",
    purpose: "WAF block check",
    method: "GET",
    path: "/api/product",
    query: { title: "%' OR 1=1 -- " },
    expected: "BLOCK",
  },
  "union-sqli": {
    id: "union-sqli",
    name: "Union-based SQLi",
    purpose: "WAF block check",
    method: "GET",
    path: "/api/product",
    query: {
      title: "%' UNION SELECT 1,username,password,0,0,0,created_at,updated_at,1,email,1,role,'leak',1,'' FROM accounts -- ",
    },
    expected: "BLOCK",
  },
  "time-sqli": {
    id: "time-sqli",
    name: "Time-based SQLi",
    purpose: "WAF block check",
    method: "GET",
    path: "/api/product",
    query: { title: "%' AND IF(1=1,SLEEP(2),0) -- " },
    expected: "BLOCK",
  },
};

function buildWafUrl(scenario, { internal = true } = {}) {
  const target = config.targets.wafSecure;
  const baseUrl = internal ? (target.internalUrl ?? target.url) : target.url;
  const url = new URL(`${baseUrl}${target.apiPrefix}${scenario.path}`);

  for (const [key, value] of Object.entries(scenario.query ?? {})) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

async function sendScenarioRequest(scenario) {
  const requestUrl = buildWafUrl(scenario);
  const displayUrl = buildWafUrl(scenario, { internal: false });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.testTimeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(requestUrl, {
      method: scenario.method,
      headers: {
        Accept: "application/json,text/plain,*/*",
        "User-Agent": "security-dashboard/0.1",
      },
      signal: controller.signal,
    });
    const body = await response.text();

    return {
      requestUrl,
      displayUrl,
      statusCode: response.status,
      body,
      parsedBody: tryParseJson(body),
      responseTimeMs: Date.now() - startedAt,
      timedOut: false,
    };
  } catch (error) {
    const timedOut = error.name === "AbortError";
    return {
      requestUrl,
      displayUrl,
      statusCode: null,
      body: timedOut ? "Request timed out" : (error.message ?? "Request failed"),
      parsedBody: null,
      responseTimeMs: Date.now() - startedAt,
      timedOut,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function classifyWafResult({ scenario, requestResult, logEvidence }) {
  if (requestResult.statusCode === null) {
    return {
      classification: "TEST_INFRA_ERROR",
      passed: false,
      reason: "Request did not reach the WAF route. Check reverse-proxy and Docker Compose status.",
    };
  }

  if (scenario.expected === "ALLOW") {
    if (requestResult.statusCode >= 200 && requestResult.statusCode < 300) {
      return {
        classification: "NORMAL_ALLOWED",
        passed: true,
        reason: "Request hop le di qua WAF, khong co dau hieu chan nham.",
      };
    }

    if (requestResult.statusCode === 403) {
      return {
        classification: "FALSE_POSITIVE_BLOCK",
        passed: false,
        reason: "Request hop le bi WAF chan, can xem lai rule hoac anomaly score.",
      };
    }

    return {
      classification: "NORMAL_FAILED",
      passed: false,
      reason: `Request hop le khong thanh cong, HTTP ${requestResult.statusCode}.`,
    };
  }

  if (requestResult.statusCode === 403) {
    const evidenceReason = logEvidence.hasSqlInjection
      ? `WAF tra HTTP 403 va log co rule SQLi ${logEvidence.ruleIds.join(", ") || "khong xac dinh"}.`
      : "WAF tra HTTP 403, nhung chua doc duoc rule SQLi tu log gan nhat.";

    return {
      classification: "WAF_BLOCKED",
      passed: true,
      reason: evidenceReason,
    };
  }

  if (requestResult.statusCode >= 500) {
    return {
      classification: "SERVER_ERROR_AFTER_BYPASS",
      passed: false,
      reason: "Payload khong bi WAF chan som va backend tra loi 5xx.",
    };
  }

  return {
    classification: "WAF_MISSED",
    passed: false,
    reason: `Payload doc hai khong bi chan, HTTP ${requestResult.statusCode}.`,
  };
}

async function collectWafLogEvidence(tail = 120) {
  const logResult = await readContainerLogs({
    containerName: config.containers.reverseProxy.name,
    tail,
  });

  if (!logResult.ok) {
    return {
      available: false,
      error: logResult.error,
      hasSqlInjection: false,
      anomalyScore: null,
      ruleIds: [],
      messages: [],
      httpStatusCodes: [],
      rawSnippet: "",
    };
  }

  return {
    available: true,
    error: null,
    ...parseWafLog(logResult.logs),
  };
}

export function listWafScenarios() {
  return Object.values(wafScenarios);
}

export async function getWafLogs({ tail } = {}) {
  return collectWafLogEvidence(tail);
}

export async function runWafScenario(scenarioId) {
  const scenario = wafScenarios[scenarioId];
  if (!scenario) {
    throw new Error(`Unknown WAF scenario: ${scenarioId}`);
  }

  const requestResult = await sendScenarioRequest(scenario);
  const logEvidence = await collectWafLogEvidence();
  const classification = classifyWafResult({
    scenario,
    requestResult,
    logEvidence,
  });

  return {
    id: scenario.id,
    name: scenario.name,
    purpose: scenario.purpose,
    expected: scenario.expected,
    url: requestResult.displayUrl,
    statusCode: requestResult.statusCode,
    responseTimeMs: requestResult.responseTimeMs,
    classification: classification.classification,
    classificationReason: classification.reason,
    passed: classification.passed,
    timedOut: requestResult.timedOut,
    responseSnippet: buildSnippet(requestResult.body),
    logEvidence,
    createdAt: new Date().toISOString(),
  };
}

export async function runWafScenarios(scenarioIds) {
  const selectedIds = scenarioIds?.length ? scenarioIds : Object.keys(wafScenarios);
  const results = [];

  for (const scenarioId of selectedIds) {
    results.push(await runWafScenario(scenarioId));
  }

  return results;
}

export async function runFalsePositiveChecks() {
  return runWafScenarios(["normal-search"]);
}

export async function runFalseNegativeChecks() {
  return runWafScenarios(["boolean-sqli", "union-sqli", "time-sqli"]);
}
