import { getMockCampaignContext } from "@/lib/data/adapters/mock";
import { createCampaignContext } from "@/lib/data/normalization/campaign-context";
import type { CampaignInput } from "@/lib/types/campaign";
import type { CampaignContext } from "@/lib/types/orchestrator";
import { runAssetSelectionAgent } from "@/lib/workflow/steps/asset-selection-agent";
import { runAudienceAgent } from "@/lib/workflow/steps/audience-agent";
import { runCampaignStrategistAgent } from "@/lib/workflow/steps/campaign-strategist-agent";
import { runContentGeneratorAgent } from "@/lib/workflow/steps/content-generator-agent";
import { runProductMatchAgent } from "@/lib/workflow/steps/product-match-agent";
import { runReviewAgent } from "@/lib/workflow/steps/review-agent";

export function runAgenticFlowOrchestrator(input: CampaignInput): CampaignContext {
  const mockContext = getMockCampaignContext();

  const context = createCampaignContext({
    input,
    audiences: mockContext.audiences,
    products: mockContext.products,
    assets: mockContext.assets,
    sourceMode: "mock",
  });

  context.meta.status = "running-audience-step";
  const audienceStep = runAudienceAgent(context);
  context.selections.selectedAudience = audienceStep.data.selectedAudience;
  context.trace.workflowSteps.push(audienceStep);

  context.meta.status = "running-product-step";
  const productStep = runProductMatchAgent(context);
  context.selections.selectedProducts = productStep.data.selectedProducts;
  context.trace.workflowSteps.push(productStep);

  context.meta.status = "running-asset-step";
  const assetStep = runAssetSelectionAgent(context);
  context.selections.selectedAssets = assetStep.data.selectedAssets;
  context.trace.workflowSteps.push(assetStep);

  context.meta.status = "running-strategy-step";
  const strategyStep = runCampaignStrategistAgent(context);
  context.outputs.strategy = strategyStep.data.strategy;
  context.trace.workflowSteps.push(strategyStep);

  context.meta.status = "running-content-step";
  const contentStep = runContentGeneratorAgent(context);
  context.outputs.generatedContent = contentStep.data.generatedContent;
  context.trace.workflowSteps.push(contentStep);

  context.meta.status = "running-review-step";
  const reviewStep = runReviewAgent(context);
  context.outputs.reviewSummary = reviewStep.data.reviewSummary;
  context.trace.workflowSteps.push(reviewStep);

  context.trace.assumptions = uniqueStrings(context.trace.workflowSteps.flatMap((step) => step.assumptions));
  context.trace.warnings = ["Mock-only orchestration run. Live source integrations are not active in this phase."];
  context.trace.humanReviewRequired = true;
  context.meta.status = "complete";

  return context;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}
