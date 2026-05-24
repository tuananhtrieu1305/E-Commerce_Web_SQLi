import { useEffect, useMemo, useState } from "react";
import { Activity, ListTree, Play, RefreshCw } from "lucide-react";
import { MetricCard } from "../../components/MetricCard.jsx";
import { PageHeader } from "../../components/PageHeader.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { dashboardApi } from "../../services/dashboardApi.js";

function CountList({ counts = {} }) {
  const entries = Object.entries(counts);

  if (entries.length === 0) {
    return <div className="empty-state">No counts available</div>;
  }

  return (
    <div className="count-list">
      {entries.map(([key, value]) => (
        <div className="count-row" key={key}>
          <span>{key}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export function LoadBalancerPage() {
  const [scenarios, setScenarios] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [logs, setLogs] = useState(null);
  const [requestCount, setRequestCount] = useState(12);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const latestDistribution = useMemo(
    () => results.find((item) => item.id === "secure-distribution") ?? null,
    [results],
  );
  const summaryEvidence = latestDistribution?.logEvidence ?? logs;

  useEffect(() => {
    Promise.all([
      dashboardApi.lbScenarios(),
      dashboardApi.lbLogs(),
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
      setLogs(await dashboardApi.lbLogs());
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
        title="Load Balancer"
        actions={
          <>
            <button className="secondary-button" type="button" onClick={refreshLogs} disabled={isRunning}>
              <RefreshCw size={15} aria-hidden="true" />
              Logs
            </button>
            <button className="primary-button" type="button" onClick={() => runAction(() => dashboardApi.runAllLbScenarios(requestCount))} disabled={isRunning}>
              <Play size={16} aria-hidden="true" />
              Run LB
            </button>
          </>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="metric-grid">
        <MetricCard label="Logged LB requests" value={summaryEvidence?.totalRequests ?? 0} tone="info" />
        <MetricCard label="Distinct upstreams" value={summaryEvidence?.distinctUpstreams ?? 0} tone={(summaryEvidence?.distinctUpstreams ?? 0) >= 2 ? "success" : "neutral"} />
        <MetricCard label="Last pass state" value={latestDistribution?.passed ? "PASS" : latestDistribution ? "CHECK" : "-"} tone={latestDistribution?.passed ? "success" : "neutral"} />
        <MetricCard label="Probe requests" value={requestCount} tone="info" />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Distribution controls</h2>
          {isRunning ? <div className="run-state"><RefreshCw size={15} aria-hidden="true" /> Running</div> : null}
        </div>
        <div className="lb-control-row">
          <label className="field-control">
            <span>Request count</span>
            <input
              min="2"
              max="50"
              type="number"
              value={requestCount}
              onChange={(event) => setRequestCount(Number(event.target.value))}
            />
          </label>
          <button className="secondary-button" type="button" onClick={() => runAction(dashboardApi.runLbHealth)} disabled={isRunning}>
            <Activity size={15} aria-hidden="true" />
            Health
          </button>
          <button className="secondary-button" type="button" onClick={() => runAction(() => dashboardApi.runLbDistribution(requestCount))} disabled={isRunning}>
            <ListTree size={15} aria-hidden="true" />
            Distribution
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Scenario reference</h2>
        </div>
        <div className="test-case-grid">
          {scenarios.map((scenario) => (
            <article className="test-card" key={scenario.id}>
              <div className="test-id">{scenario.id}</div>
              <h3>{scenario.name}</h3>
              <div className="test-meta">{scenario.purpose}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>LB results</h2>
        </div>
        <div className="table-wrap">
          <table className="result-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Pass</th>
                <th>Classification</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">No LB results yet</td>
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
                    <td>{result.passed ? "Yes" : "No"}</td>
                    <td><StatusBadge status={result.classification} /></td>
                    <td className="reason-cell">{result.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="db-log-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Backend distribution</h2>
          </div>
          <div className="detail-grid">
            <CountList counts={summaryEvidence?.backendCounts} />
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <h2>Upstream addresses</h2>
          </div>
          <div className="detail-grid">
            <CountList counts={summaryEvidence?.upstreamCounts} />
          </div>
        </section>
      </div>

      {selectedResult ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Selected LB evidence</h2>
          </div>
          <div className="detail-grid">
            <div>
              <div className="detail-label">Details</div>
              <pre className="json-snippet">{JSON.stringify(selectedResult.details ?? {}, null, 2)}</pre>
            </div>
            <div>
              <div className="detail-label">Status counts</div>
              <pre className="json-snippet">{JSON.stringify(selectedResult.logEvidence?.statusCounts ?? {}, null, 2)}</pre>
            </div>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <h2>Raw LB log snippet</h2>
        </div>
        <div className="detail-grid">
          {logs?.error ? <div className="alert alert-error">{logs.error}</div> : null}
          <pre className="log-snippet">{logs?.rawSnippet || "No load balancer log snippet available"}</pre>
        </div>
      </section>
    </div>
  );
}
