function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function collectMatches(rawLog, regex) {
  return [...rawLog.matchAll(regex)].map((match) => match[1]);
}

function parseJsonAuditMessages(rawLog) {
  const messages = [];
  const ruleIds = [];

  for (const line of rawLog.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
      continue;
    }

    try {
      const parsed = JSON.parse(trimmed);
      for (const item of parsed.messages ?? []) {
        messages.push(item.message);
        ruleIds.push(item.details?.ruleId);
      }
    } catch {
      // ModSecurity audit output can be mixed with plain nginx lines.
    }
  }

  return { messages, ruleIds };
}

export function parseWafLog(rawLog = "") {
  const jsonEvidence = parseJsonAuditMessages(rawLog);
  const bracketMessages = collectMatches(rawLog, /\[msg\s+"([^"]+)"\]/g);
  const jsonMessages = collectMatches(rawLog, /"message"\s*:\s*"([^"]+)"/g);
  const bracketRuleIds = collectMatches(rawLog, /\[id\s+"(\d{4,})"\]/g);
  const jsonRuleIds = collectMatches(rawLog, /"ruleId"\s*:\s*"(\d{4,})"/g);
  const accessStatuses = collectMatches(rawLog, /"\w+\s+[^"]+\s+HTTP\/[0-9.]+"\s+(\d{3})\s/g).map(Number);
  const responseStatuses = collectMatches(rawLog, /"http_code"\s*:\s*(\d{3})/g).map(Number);
  const totalScoreMatch = rawLog.match(/Total Score:\s*(\d+)/i);
  const anomalyScoreMatch = rawLog.match(/BLOCKING_INBOUND_ANOMALY_SCORE[^)]*\(Value:\s*"?(\d+)/i);
  const anomalyScore = totalScoreMatch || anomalyScoreMatch
    ? Number((totalScoreMatch ?? anomalyScoreMatch)[1])
    : null;
  const messages = unique([
    ...jsonEvidence.messages,
    ...jsonMessages,
    ...bracketMessages,
  ]);
  const ruleIds = unique([
    ...jsonEvidence.ruleIds,
    ...jsonRuleIds,
    ...bracketRuleIds,
  ]);
  const hasSqlInjection = /SQL Injection|libinjection|attack-sqli|REQUEST-942|union.*select|or%201%3d1|or\s+1=1/i.test(rawLog)
    || messages.some((message) => /SQL Injection|libinjection|SQLi/i.test(message));

  return {
    hasSqlInjection,
    anomalyScore,
    ruleIds,
    messages,
    httpStatusCodes: unique([...accessStatuses, ...responseStatuses]).map(Number),
    rawSnippet: rawLog.slice(-4000),
  };
}
