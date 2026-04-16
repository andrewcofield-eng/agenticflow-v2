export type WorkflowStepStatus = "idle" | "ready" | "in-progress" | "complete";

export type WorkflowStep = {
  id: string;
  name: string;
  description: string;
  status: WorkflowStepStatus;
};
