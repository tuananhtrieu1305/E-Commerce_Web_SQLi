function increment(map, key) {
  if (!key) {
    return;
  }
  map[key] = (map[key] ?? 0) + 1;
}

function labelBackend(upstream) {
  const normalized = upstream?.trim().replace(/,$/, "");
  if (!normalized || normalized === "-") {
    return "none";
  }
  if (normalized.endsWith(":8083")) {
    return "backend-secure-2";
  }
  if (normalized.endsWith(":8082")) {
    return "backend-secure";
  }
  if (normalized.endsWith(":8081")) {
    return "backend-vulnerable";
  }
  return normalized;
}

function parseUpstreams(rawUpstream) {
  return rawUpstream
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseLoadBalancerLog(rawLog = "", { probeId } = {}) {
  const lines = rawLog.split(/\r?\n/).filter(Boolean);
  const entries = [];
  const upstreamCounts = {};
  const backendCounts = {};
  const statusCounts = {};

  for (const line of lines) {
    if (probeId && !line.includes(probeId)) {
      continue;
    }

    const match = line.match(/"(?<method>[A-Z]+)\s+(?<path>[^"]+)\s+HTTP\/[0-9.]+"\s+(?<status>\d{3})\s+\d+.*UPSTREAM:\s+(?<upstream>.+)$/);
    if (!match?.groups) {
      continue;
    }

    const upstreams = parseUpstreams(match.groups.upstream);
    const backends = upstreams.map(labelBackend);
    const entry = {
      method: match.groups.method,
      path: match.groups.path,
      statusCode: Number(match.groups.status),
      upstream: upstreams.join(", "),
      upstreams,
      backend: backends.join(", "),
      backends,
    };

    entries.push(entry);
    for (const upstream of upstreams) {
      increment(upstreamCounts, upstream);
      increment(backendCounts, labelBackend(upstream));
    }
    increment(statusCounts, String(entry.statusCode));
  }

  return {
    totalRequests: entries.length,
    distinctUpstreams: Object.keys(upstreamCounts).length,
    upstreamCounts,
    backendCounts,
    statusCounts,
    entries: entries.slice(-60),
    rawSnippet: rawLog.slice(-4000),
  };
}
