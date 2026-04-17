import { getSourceContext } from "@/lib/adapters/data-source-router";
import type { SourceContextPayload } from "@/lib/adapters/data-source-router";
import { createCampaignContext } from "@/lib/data/normalization/campaign-context";
import type { CampaignInput } from "@/lib/types/campaign";
import type { CampaignContext } from "@/lib/types/orchestrator";
import { runAssetSelectionAgent } from "@/lib/workflow/steps/asset-selection-agent";
import { runAudienceAgent } from "@/lib/workflow/steps/audience-agent";
import { runCampaignStrategistAgent } from "@/lib/workflow/steps/campaign-strategist-agent";
import { createCompletedContentStep, createPendingContentStep, runContentGeneratorAgent } from "@/lib/workflow/steps/content-generator-agent";
import { runProductMatchAgent } from "@/lib/workflow/steps/product-match-agent";
import { runReviewAgent } from "@/lib/workflow/steps/review-agent";

export async function runAgenticFlowOrchestrator(input: CampaignInput): Promise<CampaignContext> {
  const context = await runOrchestratorThroughStrategy(input);

  context.meta.status = "running-content-step";
  const contentStep = runContentGeneratorAgent(context);
  return finalizeCampaignContext(context, contentStep.data.generatedContent);
}

export async function runOrchestratorThroughStrategy(input: CampaignInput): Promise<CampaignContext> {
  const sourceContext = await loadSourceContext();

  const context = createCampaignContext({
    input,
    audiences: sourceContext.candidates.audiences,
    products: sourceContext.candidates.products,
    assets: sourceContext.candidates.assets,
    sourceMode: sourceContext.sourceMode,
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

  return context;
}

export async function runOrchestratorUntilPendingContent(input: CampaignInput): Promise<CampaignContext> {
  const context = await runOrchestratorThroughStrategy(input);
  context.meta.status = "running-content-step";
  context.trace.workflowSteps.push(createPendingContentStep(context));
  return context;
}

export function finalizeCampaignContext(context: CampaignContext, generatedContent: import("@/lib/types/campaign").GeneratedContent): CampaignContext {
  const nextContext: CampaignContext = JSON.parse(JSON.stringify(context));
  const completedContentStep = createCompletedContentStep(nextContext, generatedContent);

  nextContext.outputs.generatedContent = generatedContent;
  nextContext.trace.workflowSteps = nextContext.trace.workflowSteps.filter(
    (step) => step.stepId !== "content-generator-agent" && step.stepId !== "review-agent",
  );
  nextContext.trace.workflowSteps.push(completedContentStep);

  nextContext.meta.status = "running-review-step";
  const reviewStep = runReviewAgent(nextContext);
  nextContext.outputs.reviewSummary = reviewStep.data.reviewSummary;
  nextContext.trace.workflowSteps.push(reviewStep);

  nextContext.trace.assumptions = uniqueStrings(nextContext.trace.workflowSteps.flatMap((step) => step.assumptions));
  nextContext.trace.warnings = nextContext.meta.sourceMode === "mock"
    ? ["Mock-only orchestration run. Live source integrations are not active in this phase."]
    : nextContext.meta.sourceMode === "mixed"
      ? ["Some live source fetches fell back to mock data for this run."]
      : [];
  nextContext.trace.humanReviewRequired = true;
  nextContext.meta.status = "complete";

  return nextContext;
}

async function loadSourceContext(): Promise<SourceContextPayload> {
  if (typeof window === "undefined") {
    return getSourceContext();
  }

  const response = await fetch("/api/source-context", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load source context.");
  }

  return response.json() as Promise<SourceContextPayload>;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}
