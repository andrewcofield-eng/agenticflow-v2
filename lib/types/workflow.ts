export type OrchestratorStatus =
  | "idle"
  | "validating-input"
  | "assembling-context"
  | "running-audience-step"
  | "running-product-step"
  | "running-asset-step"
  | "running-strategy-step"
  | "running-content-step"
  | "running-review-step"
  | "complete"
  | "error";

export type WorkflowStepStatus = "idle" | "running" | "complete" | "warning" | "error";

export type WorkflowStepResult<TData = unknown> = {
  stepId: string;
  stepName: string;
  status: WorkflowStepStatus;
  inputSummary: string[];
  outputSummary: string[];
  reasoning: string[];
  assumptions: string[];
  confidence?: "low" | "medium" | "high";
  data: TData;
};
