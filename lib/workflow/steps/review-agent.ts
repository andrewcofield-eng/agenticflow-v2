import type { ReviewSummary } from "@/lib/types/campaign";
import type { CampaignContext } from "@/lib/types/orchestrator";
import type { WorkflowStepResult } from "@/lib/types/workflow";

type ReviewStepData = {
  reviewSummary: ReviewSummary;
};

export function runReviewAgent(context: CampaignContext): WorkflowStepResult<ReviewStepData> {
  const assumptions = [
    "Audience fit uses simplified mock CRM metadata.",
    "Product ranking is based on tag alignment, not live performance data.",
    "Asset selection is based on simplified DAM metadata.",
    "Strategy and content use placeholder generation in this MVP pass.",
  ];

  const checklist = [
    "Approve audience relevance",
    "Approve product prioritization",
    "Approve asset fit for intended channels",
    "Refine messaging tone if needed",
    "Approve campaign package before activation",
  ];

  const reviewSummary: ReviewSummary = {
    completenessSummary: "Campaign package includes audience, products, assets, strategy, content drafts, and rationale trace.",
    consistencySummary: "Selected products and assets align with the recommended audience and campaign objective using the mock scoring rules.",
    assumptionsList: assumptions,
    humanReviewChecklist: checklist,
    finalReviewStatus: "ready-for-review",
  };

  return {
    stepId: "review-agent",
    stepName: "Review Agent",
    status: "complete",
    inputSummary: [
      `Workflow steps completed before review: ${context.trace.workflowSteps.length}`,
      `Recommended products: ${context.selections.selectedProducts.length}`,
      `Recommended assets: ${context.selections.selectedAssets.length}`,
      `Content drafted: ${context.outputs.generatedContent ? "Yes" : "No"}`,
    ],
    outputSummary: ["Draft marked ready for human review", "Review checklist prepared"],
    reasoning: [reviewSummary.completenessSummary, reviewSummary.consistencySummary],
    assumptions,
    confidence: "medium",
    data: {
      reviewSummary,
    },
  };
}
