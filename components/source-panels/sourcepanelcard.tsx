type SourcePanelCardProps = {
  systemName: string;
  systemType: string;
  summary: string;
  items: string[];
};

export default function SourcePanelCard({ systemName, systemType, summary, items }: SourcePanelCardProps) {
  return (
    <div className="panel-card">
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div>
          <p className="eyebrow">{systemType}</p>
          <h3>{systemName}</h3>
        </div>
        <span className="badge">Mock source</span>
      </div>
      <p className="muted">{summary}</p>
      <ul className="list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
