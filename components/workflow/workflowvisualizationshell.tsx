import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";
import type { WorkflowStepResult } from "@/lib/types/workflow";
import OrchestratorPanel from "./orchestratorpanel";

type WorkflowVisualizationShellProps = {
  steps: WorkflowStepResult[];
  isRunning: boolean;
  currentStepIndex: number;
};

const stepDescriptions: Record<string, string> = {
  "Audience Agent": "Validates or recommends the best-fit audience for the campaign objective.",
  "Product Match Agent": "Ranks which products best fit the audience and selected goal.",
  "Asset Selection Agent": "Selects the strongest brand assets for the products and channel direction.",
  "Campaign Strategist": "Builds the campaign angle, value proposition, CTA, and channel direction.",
  "Content Generator": "Drafts the channel-specific campaign content package.",
  "Review Agent": "Checks completeness, consistency, assumptions, and human review needs.",
};

export default function WorkflowVisualizationShell({ steps, isRunning, currentStepIndex }: WorkflowVisualizationShellProps) {
  return (
    <SectionCard>
      <PageHeader
        eyebrow="Orchestrator workflow"
        title="The central orchestrator coordinates each specialist module"
        description="This panel shows the campaign flow progressing step by step, with visible outputs and reasoning from each module."
      />

      <OrchestratorPanel steps={steps} isRunning={isRunning} currentStepIndex={currentStepIndex} />

      <div className="workflow-grid" style={{ marginTop: 20 }}>
        {steps.map((step, index) => {
          const isCurrent = isRunning && index === currentStepIndex;
          return (
            <div key={step.stepId} className="workflow-card" style={{ borderColor: isCurrent ? "rgba(125, 211, 252, 0.5)" : undefined }}>
              <p className="eyebrow">Step {index + 1}</p>
              <h3>{step.stepName}</h3>
              <p className="muted">{stepDescriptions[step.stepName]}</p>
              <p className="status-dot" style={{ marginTop: 16 }}>{isCurrent ? "Running" : step.status === "complete" ? "Complete" : step.status}</p>
              {step.outputSummary.length > 0 ? (
                <ul className="list">
                  {step.outputSummary.slice(0, 3).map((item, summaryIndex) => (
                    <li key={`${step.stepId}-summary-${summaryIndex}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
