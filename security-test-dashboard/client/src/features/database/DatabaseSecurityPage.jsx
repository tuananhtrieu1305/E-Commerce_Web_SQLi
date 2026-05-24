import { useEffect, useState } from "react";
import { DatabaseZap, Play, RefreshCw, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/PageHeader.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { dashboardApi } from "../../services/dashboardApi.js";

function JsonSnippet({ value }) {
  return (
    <pre className="json-snippet">
      {JSON.stringify(value ?? {}, null, 2)}
    </pre>
  );
}

function LogTable({ title, rows }) {
  const columns = rows.length ? Object.keys(rows[0]).slice(0, 7) : [];

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      <div className="table-wrap">
        <table className="result-table">
          <thead>
            <tr>
              {columns.length ? columns.map((column) => <th key={column}>{column}</th>) : <th>Log</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={Math.max(columns.length, 1)} className="empty-cell">No log rows</td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${title}-${row.id ?? index}`}>
                  {columns.map((column) => (
                    <td className="reason-cell" key={column}>{String(row[column] ?? "-")}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DatabaseSecurityPage() {
  const [checks, setChecks] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [auditRows, setAuditRows] = useState([]);
  const [rejectRows, setRejectRows] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      dashboardApi.dbChecks(),
      dashboardApi.dbAuditLog(),
      dashboardApi.dbRejectLog(),
    ]).then(([checkData, auditData, rejectData]) => {
      setChecks(checkData.items ?? []);
      setAuditRows(auditData.items ?? []);
      setRejectRows(rejectData.items ?? []);
    }).catch((err) => {
      setError(err.message);
    });
  }, []);

  async function refreshLogs() {
    setError(null);
    try {
      const [auditData, rejectData] = await Promise.all([
        dashboardApi.dbAuditLog(),
        dashboardApi.dbRejectLog(),
      ]);
      setAuditRows(auditData.items ?? []);
      setRejectRows(rejectData.items ?? []);
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
        title="Database Security"
        actions={
          <>
            <button className="secondary-button" type="button" onClick={refreshLogs} disabled={isRunning}>
              <RefreshCw size={15} aria-hidden="true" />
              Logs
            </button>
            <button className="primary-button" type="button" onClick={() => runAction(dashboardApi.runAllDbChecks)} disabled={isRunning}>
              <Play size={16} aria-hidden="true" />
              Run DB checks
            </button>
          </>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="panel">
        <div className="panel-header">
          <h2>Security controls</h2>
          {isRunning ? <div className="run-state"><RefreshCw size={15} aria-hidden="true" /> Running</div> : null}
        </div>
        <div className="test-case-grid">
          {checks.map((check) => (
            <article className="test-card" key={check.id}>
              <div className="test-id">{check.id}</div>
              <h3>{check.name}</h3>
              <div className="test-meta">{check.purpose}</div>
              <button className="secondary-button" type="button" onClick={() => runAction(() => dashboardApi.runDbCheck(check.id))} disabled={isRunning}>
                <ShieldCheck size={15} aria-hidden="true" />
                Run
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>DB check results</h2>
        </div>
        <div className="table-wrap">
          <table className="result-table">
            <thead>
              <tr>
                <th>Check</th>
                <th>Pass</th>
                <th>Classification</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">No DB results yet</td>
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

      {selectedResult ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Selected DB evidence</h2>
          </div>
          <div className="detail-grid">
            <div>
              <div className="detail-label">Rows</div>
              <JsonSnippet value={selectedResult.rows} />
            </div>
            <div>
              <div className="detail-label">Details</div>
              <JsonSnippet value={selectedResult.details} />
            </div>
          </div>
        </section>
      ) : null}

      <div className="db-log-grid">
        <LogTable title="Security audit log" rows={auditRows} />
        <LogTable title="Security reject log" rows={rejectRows} />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Evidence focus</h2>
        </div>
        <div className="empty-state">
          <DatabaseZap size={16} aria-hidden="true" /> Use screenshots of masked email, denied direct table read, and DB hard-reject log for the report.
        </div>
      </section>
    </div>
  );
}
