import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseWafLog } from "./wafLogParser.js";

const modSecurityLog = `
2026/05/17 16:32:40 [error] 595#595: *329 [client 172.23.0.1] ModSecurity: Access denied with code 403 (phase 2). Matched "Operator Ge" with parameter "5" against variable "TX:BLOCKING_INBOUND_ANOMALY_SCORE" (Value: "5" ) [file "/etc/modsecurity.d/owasp-crs/rules/REQUEST-949-BLOCKING-EVALUATION.conf"] [line "222"] [id "949110"] [msg "Inbound Anomaly Score Exceeded (Total Score: 5)"] [severity "0"] [tag "modsecurity"] [tag "OWASP_CRS"] [hostname "localhost"] [uri "/api/secure/api/product"]
{"transaction":{"client_ip":"172.23.0.1","request":{"method":"GET","uri":"/api/secure/api/product?title=%25%27%20OR%201%3D1%20--%20"},"response":{"http_code":403}},"messages":[{"message":"SQL Injection Attack Detected via libinjection","details":{"ruleId":"942100","match":"detected SQLi using libinjection."}},{"message":"Inbound Anomaly Score Exceeded (Total Score: 5)","details":{"ruleId":"949110"}}]}
`;

describe("parseWafLog", () => {
  it("extracts SQLi evidence from ModSecurity and CRS logs", () => {
    const parsed = parseWafLog(modSecurityLog);

    assert.equal(parsed.hasSqlInjection, true);
    assert.equal(parsed.anomalyScore, 5);
    assert.deepEqual(parsed.ruleIds.sort(), ["942100", "949110"]);
    assert.equal(parsed.httpStatusCodes.includes(403), true);
    assert.match(parsed.messages.join(" "), /SQL Injection Attack Detected via libinjection/i);
  });

  it("keeps normal nginx access logs as non-SQLi evidence", () => {
    const parsed = parseWafLog('172.23.0.1 - - [17/May/2026:16:31:50 +0000] "GET /api/secure/api/product?title=iPhone HTTP/1.1" 200 756 "-" "curl/8.19.0" "-"');

    assert.equal(parsed.hasSqlInjection, false);
    assert.equal(parsed.anomalyScore, null);
    assert.deepEqual(parsed.ruleIds, []);
    assert.deepEqual(parsed.httpStatusCodes, [200]);
  });
});
