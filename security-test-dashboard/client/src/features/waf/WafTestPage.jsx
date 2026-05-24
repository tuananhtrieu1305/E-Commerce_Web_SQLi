import { useEffect, useState } from "react";
import { Play, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/PageHeader.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { dashboardApi } from "../../services/dashboardApi.js";

export function WafTestPage() {
  const [scenarios, setScenarios] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [logs, setLogs] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      dashboardApi.wafScenarios(),
      dashboardApi.wafLogs(),
    ]).then(([scenarioData, logData]) => {
      setScenarios(scenarioData.items ?? []);
      setLogs(logData);
    }).catch((err) => {
      setError(err.message);
    });
  }, []);

  async function refreshLogs() {
    setError(null);
    try {
      setLogs(await dashboardApi.wafLogs());
    } catch (err) {
      setError(err.message);
    }
  }

  async function runAction(action) {
    setIsRunning(true);
    setError(null);
    try {
      const data = await action();
      setResults((current) => [...(data.items ?? []), ...current]);
      setSelectedResult(data.items?.[0] ?? null);
      await refreshLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="WAF"
        actions={
          <>
            <button className="secondary-button" type="button" onClick={refreshLogs} disabled={isRunning}>
              <RefreshCw size={15} aria-hidden="true" />
              Logs
            </button>
            <button className="primary-button" type="button" onClick={() => runAction(dashboardApi.runAllWafScenarios)} disabled={isRunning}>
              <Play size={16} aria-hidden="true" />
              Run WAF
            </button>
          </>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="panel">
        <div className="panel-header">
          <h2>WAF checks</h2>
          {isRunning ? <div className="run-state"><RefreshCw size={15} aria-hidden="true" /> Running</div> : null}
        </div>
        <div className="waf-action-grid">
          <button className="waf-action" type="button" onClick={() => runAction(dashboardApi.runWafFalsePositive)} disabled={isRunning}>
            <ShieldCheck size={20} aria-hidden="true" />
            <span>
              <strong>False positive</strong>
              <small>Request hợp lệ phải đi qua WAF</small>
            </span>
          </button>
          <button className="waf-action" type="button" onClick={() => runAction(dashboardApi.runWafFalseNegative)} disabled={isRunning}>
            <ShieldAlert size={20} aria-hidden="true" />
            <span>
              <strong>False negative</strong>
              <small>Payload SQLi phải bị chặn</small>
            </span>
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Scenarios</h2>
        </div>
        <div className="test-case-grid">
          {scenarios.map((scenario) => (
            <article className="test-card" key={scenario.id}>
              <div className="test-id">{scenario.id}</div>
              <h3>{scenario.name}</h3>
              <div className="test-meta">{scenario.purpose} · expected {scenario.expected}</div>
              <button className="secondary-button" type="button" onClick={() => runAction(() => dashboardApi.runWafScenario(scenario.id))} disabled={isRunning}>
                <Play size={15} aria-hidden="true" />
                Run
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>WAF results</h2>
        </div>
        <div className="table-wrap">
          <table className="result-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Expected</th>
                <th>Pass</th>
                <th>Status</th>
                <th>Time</th>
                <th>Classification</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">No WAF results yet</td>
                </tr>
              ) : (
                results.map((result) => (
                  <tr
                    key={`${result.id}-${result.createdAt}`}
                    className="clickable-row"
                    onClick={() => setSelectedResult(result)}
                  >
                    <td>
                      <div className="table-primary">{result.id}</div>
                      <div className="table-secondary">{result.name}</div>
                    </td>
                    <td>{result.expected}</td>
                    <td>{result.passed ? "Yes" : "No"}</td>
                    <td>{result.statusCode ?? "-"}</td>
                    <td>{result.responseTimeMs ? `${result.responseTimeMs} ms` : "-"}</td>
                    <td><StatusBadge status={result.classification} /></td>
                    <td className="reason-cell">{result.classificationReason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Log evidence</h2>
        </div>
        <div className="detail-grid">
          <div className="evidence-grid">
            <div>
              <div className="detail-label">Available</div>
              <div className="detail-mono">{logs?.available ? "Yes" : "No"}</div>
            </div>
            <div>
              <div className="detail-label">SQLi detected</div>
              <div className="detail-mono">{logs?.hasSqlInjection ? "Yes" : "No"}</div>
            </div>
            <div>
              <div className="detail-label">Anomaly score</div>
              <div className="detail-mono">{logs?.anomalyScore ?? "-"}</div>
            </div>
            <div>
              <div className="detail-label">Rule IDs</div>
              <div className="detail-mono">{logs?.ruleIds?.length ? logs.ruleIds.join(", ") : "-"}</div>
            </div>
          </div>
          {logs?.error ? (
            <div className="alert alert-error">{logs.error}</div>
          ) : null}
          <div>
            <div className="detail-label">Messages</div>
            <div className="detail-snippet">{logs?.messages?.length ? logs.messages.join("\n") : "No ModSecurity message parsed yet"}</div>
          </div>
          <div>
            <div className="detail-label">Raw snippet</div>
            <pre className="log-snippet">{logs?.rawSnippet || "No log snippet available"}</pre>
          </div>
        </div>
      </section>

      {selectedResult ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Selected evidence</h2>
          </div>
          <div className="detail-grid">
            <div>
              <div className="detail-label">URL</div>
              <div className="detail-mono">{selectedResult.url}</div>
            </div>
            <div>
              <div className="detail-label">Response</div>
              <div className="detail-snippet">{selectedResult.responseSnippet}</div>
            </div>
            <div>
              <div className="detail-label">Log rule IDs</div>
              <div className="detail-mono">{selectedResult.logEvidence?.ruleIds?.length ? selectedResult.logEvidence.ruleIds.join(", ") : "-"}</div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
