export function StatusBadge({ status }) {
  const normalized = String(status ?? "unknown").toLowerCase();
  return <span className={`status-badge status-${normalized}`}>{status ?? "UNKNOWN"}</span>;
}

