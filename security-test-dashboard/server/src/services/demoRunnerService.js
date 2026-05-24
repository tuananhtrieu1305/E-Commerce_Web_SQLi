import { runAllDbChecks } from "./databaseSecurityService.js";
import { runLoadBalancerDistributionTest, runLoadBalancerHealthCheck } from "./loadBalancerService.js";
import { addResults, summarizeResults } from "./resultStore.js";
import { runTestAcrossTargets } from "./requestRunner.js";
import { runFalseNegativeChecks, runFalsePositiveChecks } from "./wafTestService.js";

function summarizeItems(items) {
  const total = items.length;
  const passed = items.filter((item) => item.passed).length;

  return {
    total,
    passed,
    failed: total - passed,
  };
}

async function runStep({ id, label, category, action }) {
  const startedAt = Date.now();

  try {
    const items = await action();
    addResults(items, category);

    return {
      id,
      label,
      category,
      status: "COMPLETED",
      durationMs: Date.now() - startedAt,
      summary: summarizeItems(items),
      items,
    };
  } catch (error) {
    const item = {
      id,
      name: label,
      category,
      classification: "TEST_INFRA_ERROR",
      passed: false,
      reason: error.message ?? "Demo step failed",
      createdAt: new Date().toISOString(),
    };
    addResults([item], category);

    return {
      id,
      label,
      category,
      status: "FAILED",
      durationMs: Date.now() - startedAt,
      summary: summarizeItems([item]),
      items: [item],
    };
  }
}

async function runQuickSqliChecks() {
  const results = [];
  const selectedChecks = [
    { testId: "TC-00", targetKeys: ["secure", "wafSecure"] },
    { testId: "TC-02", targetKeys: ["vulnerable", "secure", "wafSecure"] },
    { testId: "TC-03", targetKeys: ["vulnerable", "secure", "wafSecure"] },
    { testId: "TC-06", targetKeys: ["secure", "wafSecure"] },
  ];

  for (const check of selectedChecks) {
    results.push(...await runTestAcrossTargets(check));
  }

  return results;
}

export async function runDemoSuite({ requestCount = 8 } = {}) {
  const startedAt = Date.now();
  const steps = [];

  steps.push(await runStep({
    id: "demo-sqli",
    label: "SQLi before/after checks",
    category: "SQLI",
    action: runQuickSqliChecks,
  }));

  steps.push(await runStep({
    id: "demo-waf",
    label: "WAF false positive / false negative checks",
    category: "WAF",
    action: async () => [
      ...await runFalsePositiveChecks(),
      ...await runFalseNegativeChecks(),
    ],
  }));

  steps.push(await runStep({
    id: "demo-database",
    label: "Database masking, least privilege, and hard-reject checks",
    category: "DATABASE",
    action: runAllDbChecks,
  }));

  steps.push(await runStep({
    id: "demo-load-balancer",
    label: "Load balancer health and distribution checks",
    category: "LOAD_BALANCER",
    action: async () => [
      await runLoadBalancerHealthCheck(),
      await runLoadBalancerDistributionTest({ requestCount }),
    ],
  }));

  return {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    steps,
    evidenceSummary: summarizeResults(),
  };
}
