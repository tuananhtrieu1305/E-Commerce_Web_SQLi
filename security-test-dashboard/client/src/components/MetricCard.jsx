export function MetricCard({ label, value, tone = "neutral" }) {
  return (
    <section className={`metric-card metric-${tone}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </section>
  );
}

