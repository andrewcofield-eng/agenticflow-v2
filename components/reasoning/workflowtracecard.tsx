import type { WorkflowStepResult } from "@/lib/types/workflow";

type WorkflowTraceCardProps = {
  step: WorkflowStepResult;
};

export default function WorkflowTraceCard({ step }: WorkflowTraceCardProps) {
  const reasoning = uniqueStrings(step.reasoning);
  const assumptions = uniqueStrings(step.assumptions);

  return (
    <div className="mini-card">
      <div className="section-header" style={{ marginBottom: 10 }}>
        <div>
          <p className="eyebrow">{step.stepName}</p>
          <h3>{step.outputSummary[0] ?? "No output yet"}</h3>
        </div>
        <span className={`badge ${confidenceBadgeClass(step.confidence)}`}>{step.confidence ?? "n/a"} confidence</span>
      </div>

      <p className="muted">Why this step landed here:</p>
      <ul className="list">
        {reasoning.map((item, index) => (
          <li key={`${step.stepId}-reason-${index}`}>{item}</li>
        ))}
      </ul>

      {assumptions.length > 0 ? (
        <>
          <p className="muted" style={{ marginTop: 16 }}>Assumptions</p>
          <ul className="list">
            {assumptions.map((item, index) => (
              <li key={`${step.stepId}-assumption-${index}`}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

function confidenceBadgeClass(confidence?: WorkflowStepResult["confidence"]) {
  if (confidence === "high") return "badge-success";
  if (confidence === "medium") return "badge-warning";
  if (confidence === "low") return "badge-subtle";
  return "badge-subtle";
}
