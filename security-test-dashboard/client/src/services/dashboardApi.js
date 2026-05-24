const jsonHeaders = {
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: jsonHeaders,
    ...options,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(typeof payload === "string" ? payload : payload.message ?? "Request failed");
  }

  return payload;
}

export const dashboardApi = {
  health: () => request("/api/health"),
  testCases: () => request("/api/tests"),
  runTest: ({ testId, targetKey, targetKeys, payload }) => request("/api/tests/run", {
    method: "POST",
    body: JSON.stringify({ testId, targetKey, targetKeys, payload }),
  }),
  runAllTests: () => request("/api/tests/run-all", {
    method: "POST",
    body: JSON.stringify({}),
  }),
  results: (category = "SQLI") => request(`/api/results${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  evidence: (category = "") => request(`/api/results/evidence${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  evidenceStorage: () => request("/api/results/storage"),
  evidenceMarkdown: (category = "") => request(`/api/results/markdown${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  clearEvidence: (category = "") => request(`/api/results${category ? `?category=${encodeURIComponent(category)}` : ""}`, {
    method: "DELETE",
  }),
  resultsSummary: (category = "SQLI") => request(`/api/results/summary${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  wafScenarios: () => request("/api/waf/scenarios"),
  wafLogs: () => request("/api/waf/logs?tail=120"),
  runWafScenario: (scenarioId) => request("/api/waf/test", {
    method: "POST",
    body: JSON.stringify({ scenarioId }),
  }),
  runAllWafScenarios: () => request("/api/waf/test", {
    method: "POST",
    body: JSON.stringify({}),
  }),
  runWafFalsePositive: () => request("/api/waf/false-positive-test", {
    method: "POST",
    body: JSON.stringify({}),
  }),
  runWafFalseNegative: () => request("/api/waf/false-negative-test", {
    method: "POST",
    body: JSON.stringify({}),
  }),
  dbChecks: () => request("/api/db/checks"),
  runDbCheck: (checkId) => request("/api/db/checks/run", {
    method: "POST",
    body: JSON.stringify({ checkId }),
  }),
  runAllDbChecks: () => request("/api/db/checks/run", {
    method: "POST",
    body: JSON.stringify({}),
  }),
  dbAuditLog: () => request("/api/db/audit-log?limit=20"),
  dbRejectLog: () => request("/api/db/reject-log?limit=20"),
  lbScenarios: () => request("/api/lb/scenarios"),
  lbLogs: () => request("/api/lb/logs?tail=180"),
  runLbScenario: (scenarioId, requestCount = 12) => request("/api/lb/test", {
    method: "POST",
    body: JSON.stringify({ scenarioId, requestCount }),
  }),
  runAllLbScenarios: (requestCount = 12) => request("/api/lb/test", {
    method: "POST",
    body: JSON.stringify({ requestCount }),
  }),
  runLbHealth: () => request("/api/lb/health-check", {
    method: "POST",
    body: JSON.stringify({}),
  }),
  runLbDistribution: (requestCount = 12) => request("/api/lb/distribution-test", {
    method: "POST",
    body: JSON.stringify({ requestCount }),
  }),
  runDemoSuite: (requestCount = 8) => request("/api/demo/run", {
    method: "POST",
    body: JSON.stringify({ requestCount }),
  }),
};
