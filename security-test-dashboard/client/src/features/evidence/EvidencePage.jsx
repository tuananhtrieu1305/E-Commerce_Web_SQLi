import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Trash2 } from "lucide-react";
import { MetricCard } from "../../components/MetricCard.jsx";
import { PageHeader } from "../../components/PageHeader.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { dashboardApi } from "../../services/dashboardApi.js";

const filters = [
  { id: "", label: "All" },
  { id: "SQLI", label: "SQLi" },
  { id: "WAF", label: "WAF" },
  { id: "DATABASE", label: "Database" },
  { id: "LOAD_BALANCER", label: "Load Balancer" },
];

function downloadTextFile({ filename, text }) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function EvidencePage() {
  const [filter, setFilter] = useState("");
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0, blockRate: 0, byCategory: {} });
  const [storage, setStorage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const categoryRows = useMemo(
    () => Object.entries(summary.byCategory ?? {}).map(([category, value]) => ({
      category,
      ...value,
    })),
    [summary.byCategory],
  );

  async function loadEvidence(nextFilter = filter) {
    setIsLoading(true);
    setError(null);
    try {
      const [data, storageData] = await Promise.all([
        dashboardApi.evidence(nextFilter),
        dashboardApi.evidenceStorage(),
      ]);
      setItems(data.items ?? []);
      setSummary(data.summary ?? { total: 0, passed: 0, failed: 0, blockRate: 0, byCategory: {} });
      setStorage(storageData);
      setSelectedItem(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvidence(filter);
  }, [filter]);

  async function exportMarkdown() {
    setError(null);
    try {
      const markdown = await dashboardApi.evidenceMarkdown(filter);
      downloadTextFile({
        filename: `security-evidence${filter ? `-${filter.toLowerCase()}` : ""}.md`,
        text: markdown,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearCurrentEvidence() {
    setError(null);
    try {
      await dashboardApi.clearEvidence(filter);
      await loadEvidence(filter);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Evidence"
        actions={
          <>
            <button className="secondary-button" type="button" onClick={() => loadEvidence(filter)} disabled={isLoading}>
              <RefreshCw size={15} aria-hidden="true" />
              Refresh
            </button>
            <button className="secondary-button" type="button" onClick={exportMarkdown} disabled={isLoading || items.length === 0}>
              <Download size={15} aria-hidden="true" />
              Markdown
            </button>
            <button className="secondary-button" type="button" onClick={clearCurrentEvidence} disabled={isLoading || items.length === 0}>
              <Trash2 size={15} aria-hidden="true" />
              Clear
            </button>
          </>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="metric-grid">
        <MetricCard label="Total evidence" value={summary.total ?? 0} tone="info" />
        <MetricCard label="Passed" value={summary.passed ?? 0} tone="success" />
        <MetricCard label="Failed" value={summary.failed ?? 0} tone={(summary.failed ?? 0) > 0 ? "danger" : "neutral"} />
        <MetricCard label="Block rate" value={`${summary.blockRate ?? 0}%`} tone="info" />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Persistence</h2>
          <StatusBadge status={storage?.error ? "FAILED" : storage?.exists ? "UP" : "UNKNOWN"} />
        </div>
        <div className="detail-grid">
          <div className="evidence-grid">
            <div>
              <div className="detail-label">Stored records</div>
              <div className="detail-mono">{storage?.resultCount ?? 0}</div>
            </div>
            <div>
              <div className="detail-label">File size</div>
              <div className="detail-mono">{storage?.fileSizeBytes ?? 0} bytes</div>
            </div>
            <div>
              <div className="detail-label">Last saved</div>
              <div className="detail-mono">{storage?.lastPersistedAt ?? "-"}</div>
            </div>
          </div>
          <div>
            <div className="detail-label">Storage file</div>
            <div className="detail-mono">{storage?.path ?? "-"}</div>
          </div>
          {storage?.error ? <div className="alert alert-error">{storage.error}</div> : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Filters</h2>
          {isLoading ? <div className="run-state"><RefreshCw size={15} aria-hidden="true" /> Loading</div> : null}
        </div>
        <div className="filter-row">
          {filters.map((item) => (
            <button
              className={`filter-button ${filter === item.id ? "filter-button-active" : ""}`}
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Category summary</h2>
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
                  <td colSpan="4" className="empty-cell">No category summary yet</td>
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

      <section className="panel">
        <div className="panel-header">
          <h2>Evidence records</h2>
        </div>
        <div className="table-wrap">
          <table className="result-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Check</th>
                <th>Pass</th>
                <th>Status</th>
                <th>Classification</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">No evidence yet. Run checks in SQLi, WAF, Database, or Load Balancer tabs.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.evidenceId}
                    className="clickable-row"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td>{item.category}</td>
                    <td>
                      <div className="table-primary">{item.id}</div>
                      <div className="table-secondary">{item.name}</div>
                    </td>
                    <td>{item.passed ? "Yes" : "No"}</td>
                    <td>{item.statusCode ?? "-"}</td>
                    <td><StatusBadge status={item.classification} /></td>
                    <td className="reason-cell">{item.classificationReason ?? item.reason ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedItem ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Selected record</h2>
          </div>
          <div className="detail-grid">
            <div>
              <div className="detail-label">Evidence ID</div>
              <div className="detail-mono">{selectedItem.evidenceId}</div>
            </div>
            <div>
              <div className="detail-label">Captured at</div>
              <div className="detail-mono">{selectedItem.createdAt}</div>
            </div>
            <div>
              <div className="detail-label">Payload / URL</div>
              <div className="detail-mono">{selectedItem.payload ?? selectedItem.url ?? "-"}</div>
            </div>
            <div>
              <div className="detail-label">Details</div>
              <pre className="json-snippet">{JSON.stringify({
                baseline: selectedItem.baseline,
                details: selectedItem.details,
                logEvidence: selectedItem.logEvidence,
                rows: selectedItem.rows,
              }, null, 2)}</pre>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
