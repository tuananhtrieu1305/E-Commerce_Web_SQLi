import { StatusBadge } from "./StatusBadge.jsx";

export function ResultTable({ rows = [], onSelect }) {
  return (
    <div className="table-wrap">
      <table className="result-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Payload</th>
            <th>Target</th>
            <th>Pass</th>
            <th>Status</th>
            <th>Time</th>
            <th>Records</th>
            <th>Classification</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="9" className="empty-cell">
                No results yet
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={`${row.id}-${row.target}-${row.createdAt}`}
                className={onSelect ? "clickable-row" : undefined}
                onClick={() => onSelect?.(row)}
              >
                <td>
                  <div className="table-primary">{row.id}</div>
                  <div className="table-secondary">{row.name}</div>
                </td>
                <td>{row.payloadSource ?? "-"}</td>
                <td>{row.targetLabel ?? row.target}</td>
                <td>{row.passed ? "Yes" : "No"}</td>
                <td>{row.statusCode ?? "-"}</td>
                <td>{row.responseTimeMs ? `${row.responseTimeMs} ms` : "-"}</td>
                <td>{row.recordCount ?? 0}</td>
                <td>
                  <StatusBadge status={row.classification} />
                </td>
                <td className="reason-cell">{row.classificationReason ?? "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
