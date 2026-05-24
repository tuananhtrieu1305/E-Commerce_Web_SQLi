import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseLoadBalancerLog } from "./lbLogParser.js";

const sampleLog = `
172.23.0.1 - - [24/May/2026:15:10:01 +0000] "GET /api/secure/api/product?title=iPhone&probe=lb-abc-1 HTTP/1.1" 200 756 "-" "Wget" "-" UPSTREAM: 172.23.0.8:8082
172.23.0.1 - - [24/May/2026:15:10:02 +0000] "GET /api/secure/api/product?title=iPhone&probe=lb-abc-2 HTTP/1.1" 200 756 "-" "Wget" "-" UPSTREAM: 172.23.0.9:8083
172.23.0.1 - - [24/May/2026:15:10:03 +0000] "GET /api/secure/api/product?title=iPhone&probe=lb-abc-3 HTTP/1.1" 200 756 "-" "Wget" "-" UPSTREAM: 172.23.0.8:8082, 172.23.0.9:8083
172.23.0.1 - - [24/May/2026:15:10:03 +0000] "GET /api/secure/api/product?title=iPhone HTTP/1.1" 200 756 "-" "curl/8.19.0" "-" UPSTREAM: 172.23.0.8:8082
`;

describe("parseLoadBalancerLog", () => {
  it("extracts upstream distribution for a probe id", () => {
    const parsed = parseLoadBalancerLog(sampleLog, { probeId: "lb-abc" });

    assert.equal(parsed.totalRequests, 3);
    assert.equal(parsed.statusCounts["200"], 3);
    assert.deepEqual(parsed.upstreamCounts, {
      "172.23.0.8:8082": 2,
      "172.23.0.9:8083": 2,
    });
    assert.deepEqual(parsed.backendCounts, {
      "backend-secure": 2,
      "backend-secure-2": 2,
    });
  });

  it("parses all load balancer access log lines when no probe id is provided", () => {
    const parsed = parseLoadBalancerLog(sampleLog);

    assert.equal(parsed.totalRequests, 4);
    assert.equal(parsed.backendCounts["backend-secure"], 3);
    assert.equal(parsed.backendCounts["backend-secure-2"], 2);
  });
});
