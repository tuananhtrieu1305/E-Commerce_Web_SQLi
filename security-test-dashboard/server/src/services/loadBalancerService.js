import { config } from "../config.js";
import { readContainerLogs } from "./dockerLogService.js";
import { parseLoadBalancerLog } from "./lbLogParser.js";
import { runContainerCommand } from "./containerCommandService.js";

const lbScenarios = {
  "lb-health": {
    id: "lb-health",
    name: "Load balancer health endpoint",
    purpose: "Verify the LB container can answer /lb-health.",
  },
  "secure-distribution": {
    id: "secure-distribution",
    name: "Secure backend distribution",
    purpose: "Send repeated requests and parse UPSTREAM addresses from LB access log.",
  },
};

function lbContainerName() {
  return config.containers.loadBalancer.name;
}

function toResult({ scenario, classification, passed, reason, details = {}, logEvidence = null }) {
  return {
    id: scenario.id,
    name: scenario.name,
    purpose: scenario.purpose,
    classification,
    passed,
    reason,
    details,
    logEvidence,
    createdAt: new Date().toISOString(),
  };
}

function buildInternalLbUrl(path) {
  return `http://127.0.0.1${path}`;
}

async function fetchInsideLoadBalancer(path) {
  return runContainerCommand({
    containerName: lbContainerName(),
    args: ["wget", "-qO-", buildInternalLbUrl(path)],
    timeoutMs: 12000,
  });
}

async function collectLoadBalancerLogEvidence({ tail = 180, probeId } = {}) {
  const logResult = await readContainerLogs({
    containerName: lbContainerName(),
    tail,
  });

  if (!logResult.ok) {
    return {
      available: false,
      error: logResult.error,
      totalRequests: 0,
      distinctUpstreams: 0,
      upstreamCounts: {},
      backendCounts: {},
      statusCounts: {},
      entries: [],
      rawSnippet: "",
    };
  }

  return {
    available: true,
    error: null,
    ...parseLoadBalancerLog(logResult.logs, { probeId }),
  };
}

function classifyDistribution({ requestResults, logEvidence }) {
  const successCount = requestResults.filter((item) => item.ok).length;
  const failureCount = requestResults.length - successCount;
  const statusCodes = Object.keys(logEvidence.statusCounts ?? {});
  const hasOnly2xx = statusCodes.length > 0 && statusCodes.every((status) => status.startsWith("2"));

  if (successCount === 0 && logEvidence.totalRequests === 0) {
    return {
      classification: "TEST_INFRA_ERROR",
      passed: false,
      reason: "No request reached the load balancer. Check ecommerce-load-balancer container.",
    };
  }

  if (logEvidence.totalRequests === 0) {
    return {
      classification: "LB_LOG_MISSING",
      passed: false,
      reason: "Requests ran but no matching probe lines were found in LB access log.",
    };
  }

  if (logEvidence.distinctUpstreams >= 2 && hasOnly2xx && failureCount === 0) {
    return {
      classification: "LB_DISTRIBUTED",
      passed: true,
      reason: "Requests were distributed across at least two upstream backends.",
    };
  }

  if (logEvidence.distinctUpstreams >= 2) {
    return {
      classification: "LB_DISTRIBUTED_WITH_ERRORS",
      passed: false,
      reason: "LB selected multiple upstreams, but at least one request failed or returned non-2xx.",
    };
  }

  if (!hasOnly2xx || failureCount > 0) {
    return {
      classification: "LB_DEGRADED",
      passed: false,
      reason: "LB request path returned errors. Check upstream backend health and configured ports.",
    };
  }

  return {
    classification: "LB_SINGLE_UPSTREAM",
    passed: false,
    reason: "Requests reached only one upstream. This does not prove load distribution.",
  };
}

export function listLoadBalancerScenarios() {
  return Object.values(lbScenarios);
}

export async function getLoadBalancerLogs({ tail, probeId } = {}) {
  return collectLoadBalancerLogEvidence({ tail, probeId });
}

export async function runLoadBalancerHealthCheck() {
  const scenario = lbScenarios["lb-health"];
  const commandResult = await fetchInsideLoadBalancer("/lb-health");
  const passed = commandResult.ok && commandResult.stdout === "OK";

  return toResult({
    scenario,
    classification: passed ? "LB_HEALTH_OK" : "TEST_INFRA_ERROR",
    passed,
    reason: passed
      ? "Load balancer /lb-health returned OK from inside the container."
      : commandResult.error ?? "Load balancer health check failed.",
    details: {
      stdout: commandResult.stdout,
      stderr: commandResult.stderr,
      error: commandResult.error,
    },
  });
}

export async function runLoadBalancerDistributionTest({ requestCount = 12 } = {}) {
  const scenario = lbScenarios["secure-distribution"];
  const boundedCount = Math.min(Math.max(Number(requestCount) || 12, 2), 50);
  const probeId = `lb-${Date.now()}`;
  const requestResults = [];

  for (let index = 0; index < boundedCount; index += 1) {
    const query = new URLSearchParams({
      title: "iPhone",
      probe: `${probeId}-${index}`,
    });
    requestResults.push(await fetchInsideLoadBalancer(`/api/secure/api/product?${query.toString()}`));
  }

  const logEvidence = await collectLoadBalancerLogEvidence({
    tail: Math.max(180, boundedCount + 40),
    probeId,
  });
  const classification = classifyDistribution({
    requestResults,
    logEvidence,
  });

  return toResult({
    scenario,
    classification: classification.classification,
    passed: classification.passed,
    reason: classification.reason,
    details: {
      probeId,
      requestCount: boundedCount,
      successCount: requestResults.filter((item) => item.ok).length,
      failureCount: requestResults.filter((item) => !item.ok).length,
      firstError: requestResults.find((item) => !item.ok)?.error ?? null,
    },
    logEvidence,
  });
}

export async function runLoadBalancerScenario(scenarioId, options = {}) {
  if (scenarioId === "lb-health") {
    return runLoadBalancerHealthCheck();
  }
  if (scenarioId === "secure-distribution") {
    return runLoadBalancerDistributionTest(options);
  }
  throw new Error(`Unknown load balancer scenario: ${scenarioId}`);
}

export async function runAllLoadBalancerScenarios(options = {}) {
  return [
    await runLoadBalancerHealthCheck(),
    await runLoadBalancerDistributionTest(options),
  ];
}
