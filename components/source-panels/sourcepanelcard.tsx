type SourcePanelCardProps = {
  systemName: string;
  systemType: string;
  summary: string;
  items: string[];
  sourceMode?: "live" | "mock";
  lastRefreshed?: string;
  warning?: string;
};

export default function SourcePanelCard({
  systemName,
  systemType,
  summary,
  items,
  sourceMode = "mock",
  lastRefreshed,
  warning,
}: SourcePanelCardProps) {
  return (
    <div className="panel-card">
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div>
          <p className="eyebrow">{systemType}</p>
          <h3>{systemName}</h3>
        </div>
        <span className={`badge ${sourceMode === "live" ? "badge-success" : "badge-subtle"}`}>
          {sourceMode === "live" ? "Live" : "Mock"}
        </span>
      </div>
      <p className="muted">{summary}</p>
      {sourceMode === "live" && lastRefreshed ? (
        <p className="muted" style={{ marginTop: 8, marginBottom: 8 }}>
          Last refreshed: {new Date(lastRefreshed).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </p>
      ) : null}
      {warning ? (
        <p className="muted" style={{ marginTop: 8, marginBottom: 8 }}>
          {warning}
        </p>
      ) : null}
      <ul className="list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
