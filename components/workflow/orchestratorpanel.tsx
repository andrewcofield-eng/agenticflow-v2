import type { WorkflowStepResult } from "@/lib/types/workflow";

type OrchestratorPanelProps = {
  steps: WorkflowStepResult[];
  isRunning: boolean;
  currentStepIndex: number;
};

export default function OrchestratorPanel({ steps, isRunning, currentStepIndex }: OrchestratorPanelProps) {
  const currentLabel = isRunning && steps[currentStepIndex] ? steps[currentStepIndex].stepName : "Draft ready for human review";

  return (
    <div className="mini-card">
      <div className="section-header" style={{ marginBottom: 8 }}>
        <div>
          <p className="eyebrow">Central orchestrator</p>
          <h3>{currentLabel}</h3>
        </div>
        <span className="badge">{isRunning ? "Running orchestration" : "Complete"}</span>
      </div>
      <p className="muted">
        The orchestrator assembles normalized CRM, PIM, and DAM context, runs specialist modules in sequence, and records reasoning for each decision.
      </p>
    </div>
  );
}
