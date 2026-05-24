import { StatusBadge } from "./StatusBadge.jsx";

function HealthMeta({ check }) {
  const parts = [];
  if (check.statusCode) {
    parts.push(`HTTP ${check.statusCode}`);
  }
  if (Number.isFinite(check.latencyMs)) {
    parts.push(`${check.latencyMs} ms`);
  }
  if (check.message) {
    parts.push(check.message);
  }

  return <div className="health-meta">{parts.join(" · ")}</div>;
}

export function HealthCheckList({ title, items = [] }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      <div className="service-list">
        {items.length === 0 ? (
          <div className="empty-state">No checks configured</div>
        ) : (
          items.map((item) => (
            <div className="service-row" key={item.id}>
              <div className="service-main">
                <div className="service-name">{item.label}</div>
                <div className="service-url">{item.url ?? item.name}</div>
                <HealthMeta check={item} />
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

