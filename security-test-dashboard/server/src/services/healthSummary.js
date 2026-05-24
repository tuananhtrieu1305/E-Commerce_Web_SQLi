export function summarizeChecks(checks) {
  const summary = {
    total: checks.length,
    up: 0,
    down: 0,
    unknown: 0,
  };

  for (const check of checks) {
    if (check.status === "UP") {
      summary.up += 1;
    } else if (check.status === "DOWN") {
      summary.down += 1;
    } else {
      summary.unknown += 1;
    }
  }

  return {
    ...summary,
    overall: summary.down > 0 || summary.unknown > 0 ? "DEGRADED" : "UP",
  };
}

