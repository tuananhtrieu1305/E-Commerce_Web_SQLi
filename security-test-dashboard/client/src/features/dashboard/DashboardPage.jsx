import { useEffect, useMemo, useState } from "react";
import { Play, RefreshCw } from "lucide-react";
import { HealthCheckList } from "../../components/HealthCheckList.jsx";
import { MetricCard } from "../../components/MetricCard.jsx";
import { PageHeader } from "../../components/PageHeader.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { dashboardApi } from "../../services/dashboardApi.js";

export function DashboardPage() {
  const [health, setHealth] = useState(null);
  const [evidenceSummary, setEvidenceSummary] = useState(null);
  const [demoResult, setDemoResult] = useState(null);
  const [requestCount, setRequestCount] = useState(8);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningDemo, setIsRunningDemo] = useState(false);

  const categoryRows = useMemo(
    () => Object.entries(evidenceSummary?.byCategory ?? {}).map(([category, value]) => ({
      category,
      ...value,
    })),
    [evidenceSummary?.byCategory],
  );

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [healthResult, evidenceResult] = await Promise.all([
        dashboardApi.health(),
        dashboardApi.evidence(),
      ]);
      setHealth(healthResult);
      setEvidenceSummary(evidenceResult.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function runDemoSuite() {
    setIsRunningDemo(true);
    setError(null);
    try {
      const result = await dashboardApi.runDemoSuite(requestCount);
      setDemoResult(result);
      setEvidenceSummary(result.evidenceSummary);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunningDemo(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const healthSummary = health?.summary ?? {
    total: 0,
    up: 0,
    down: 0,
    unknown: 0,
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        actions={
          <>
            <button className="secondary-button" type="button" onClick={load} disabled={isLoading || isRunningDemo}>
              <RefreshCw size={15} aria-hidden="true" />
              Refresh
            </button>
            <button className="primary-button" type="button" onClick={runDemoSuite} disabled={isRunningDemo}>
              <Play size={16} aria-hidden="true" />
              Run demo suite
            </button>
          </>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="panel">
        <div className="panel-header">
          <h2>Demo runner</h2>
          {isRunningDemo ? <div className="run-state"><RefreshCw size={15} aria-hidden="true" /> Running</div> : null}
        </div>
        <div className="lb-control-row">
          <label className="field-control">
            <span>LB requests</span>
            <input
              min="2"
              max="50"
              type="number"
              value={requestCount}
              onChange={(event) => setRequestCount(Number(event.target.value))}
            />
          </label>
          <div className="demo-note">
            Runs a quick SQLi, WAF, Database, and Load Balancer evidence suite. Results are saved in the Evidence tab.
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard label="Health checks" value={healthSummary.total} />
        <MetricCard label="Up" value={healthSummary.up} tone="success" />
        <MetricCard label="Down" value={healthSummary.down} tone={healthSummary.down > 0 ? "danger" : "neutral"} />
        <MetricCard label="Unknown" value={healthSummary.unknown} tone="info" />
      </section>

      <section className="metric-grid metric-grid-compact">
        <MetricCard label="Evidence records" value={evidenceSummary?.total ?? 0} />
        <MetricCard label="Passed" value={evidenceSummary?.passed ?? 0} tone="success" />
        <MetricCard label="Failed" value={evidenceSummary?.failed ?? 0} tone={(evidenceSummary?.failed ?? 0) > 0 ? "danger" : "neutral"} />
        <MetricCard label="Block rate" value={`${evidenceSummary?.blockRate ?? 0}%`} tone="info" />
      </section>

      {demoResult ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Latest demo run</h2>
            <div className="health-meta">{demoResult.durationMs} ms</div>
          </div>
          <div className="table-wrap">
            <table className="result-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Passed</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {demoResult.steps.map((step) => (
                  <tr key={step.id}>
                    <td>
                      <div className="table-primary">{step.label}</div>
                      <div className="table-secondary">{step.durationMs} ms</div>
                    </td>
                    <td>{step.category}</td>
                    <td><StatusBadge status={step.status} /></td>
                    <td>{step.summary.total}</td>
                    <td>{step.summary.passed}</td>
                    <td>{step.summary.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <h2>Evidence by category</h2>
        </div>
        <div className="table-wrap">
          <table className="result-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
                <th>Passed</th>
                <th>Failed</th>
              </tr>
            </thead>
            <tbody>
              {categoryRows.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">No evidence collected yet</td>
                </tr>
              ) : (
                categoryRows.map((row) => (
                  <tr key={row.category}>
                    <td><StatusBadge status={row.category} /></td>
                    <td>{row.total}</td>
                    <td>{row.passed}</td>
                    <td>{row.failed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <HealthCheckList title="HTTP targets" items={health?.services ?? []} />
      <HealthCheckList title="Docker containers" items={health?.containers ?? []} />
    </div>
  );
}
