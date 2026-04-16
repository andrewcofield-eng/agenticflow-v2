type WorkflowStepCardProps = {
  index: number;
  title: string;
  description: string;
};

export default function WorkflowStepCard({ index, title, description }: WorkflowStepCardProps) {
  return (
    <div className="workflow-card">
      <p className="eyebrow">Step {index}</p>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      <div className="workflow-state" style={{ marginTop: 16 }}>
        <span className="status-dot">Shell only</span>
      </div>
    </div>
  );
}
