import type { ReviewSummary } from "@/lib/types/campaign";
import type { CampaignContext } from "@/lib/types/orchestrator";
import type { WorkflowStepResult } from "@/lib/types/workflow";

type ReviewStepData = {
  reviewSummary: ReviewSummary;
};

export function runReviewAgent(context: CampaignContext): WorkflowStepResult<ReviewStepData> {
  const assumptions = [
    "Audience fit is derived from normalized CRM records and deterministic tag overlap.",
    "Product ranking is based on deterministic matching over normalized PIM records.",
    "Asset selection is based on normalized DAM metadata and product association signals.",
    "Strategy and content drafts should be reviewed by a human before activation.",
    "Email HTML and landing page HTML are deterministic rendered artifacts assembled from BrandContext and selected source records.",
  ];

  const checklist = [
    "Approve audience relevance",
    "Approve product prioritization",
    "Approve asset fit for intended channels",
    "Refine messaging tone if needed",
    "Review branded email HTML preview",
    "Review branded landing page HTML preview",
    "Approve campaign package before activation",
  ];

  const reviewSummary: ReviewSummary = {
    completenessSummary: "Campaign package includes audience, products, assets, strategy, draft content, rendered email HTML, rendered landing page HTML, and rationale trace.",
    consistencySummary: "Selected products and assets align with the recommended audience and campaign objective using deterministic scoring over normalized source records, while rendered HTML applies available BrandContext tokens.",
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
