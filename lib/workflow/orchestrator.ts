import { createCampaignContext } from "@/lib/data/normalization/campaign-context";
import { renderEmailHtml } from "@/lib/renderers/email-html-renderer";
import { renderLandingPageHtml } from "@/lib/renderers/landing-page-renderer";
import type { Asset } from "@/lib/types/asset";
import type { Audience } from "@/lib/types/audience";
import type { BrandContext } from "@/lib/types/brand";
import type { CampaignInput, GeneratedContent } from "@/lib/types/campaign";
import type { CampaignContext, SourceMode } from "@/lib/types/orchestrator";
import type { Product } from "@/lib/types/product";
import { runAssetSelectionAgent } from "@/lib/workflow/steps/asset-selection-agent";
import { runAudienceAgent } from "@/lib/workflow/steps/audience-agent";
import { runCampaignStrategistAgent } from "@/lib/workflow/steps/campaign-strategist-agent";
import { createCompletedContentStep, createPendingContentStep, runContentGeneratorAgent } from "@/lib/workflow/steps/content-generator-agent";
import { runProductMatchAgent } from "@/lib/workflow/steps/product-match-agent";
import { runReviewAgent } from "@/lib/workflow/steps/review-agent";

export type OrchestratorSourceContext = {
  candidates: {
    products: Product[];
    assets: Asset[];
    audiences: Audience[];
  };
  sourceMode: SourceMode;
  brandContext?: BrandContext;
  brandSourceMode?: "live" | "mock";
};

export async function runAgenticFlowOrchestrator(
  input: CampaignInput,
  sourceContext: OrchestratorSourceContext,
): Promise<CampaignContext> {
  const context = await runOrchestratorThroughStrategy(input, sourceContext);

  context.meta.status = "running-content-step";
  const contentStep = runContentGeneratorAgent(context);
  return finalizeCampaignContext(context, contentStep.data.generatedContent);
}

export async function runOrchestratorThroughStrategy(
  input: CampaignInput,
  sourceContext: OrchestratorSourceContext,
): Promise<CampaignContext> {
  const context = createCampaignContext({
    input,
    audiences: sourceContext.candidates.audiences,
    products: sourceContext.candidates.products,
    assets: sourceContext.candidates.assets,
    sourceMode: sourceContext.sourceMode,
    brandContext: sourceContext.brandContext,
    brandSourceMode: sourceContext.brandSourceMode,
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

export async function runOrchestratorUntilPendingContent(
  input: CampaignInput,
  sourceContext: OrchestratorSourceContext,
): Promise<CampaignContext> {
  const context = await runOrchestratorThroughStrategy(input, sourceContext);
  context.meta.status = "running-content-step";
  context.trace.workflowSteps.push(createPendingContentStep(context));
  return context;
}

export function finalizeCampaignContext(context: CampaignContext, generatedContent: GeneratedContent): CampaignContext {
  const nextContext: CampaignContext = JSON.parse(JSON.stringify(context));
  const contentWithArtifacts = buildRenderedArtifacts(nextContext, generatedContent);
  const completedContentStep = createCompletedContentStep(nextContext, contentWithArtifacts);

  nextContext.outputs.generatedContent = contentWithArtifacts;
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
    ? ["Live source integrations are disabled for this run, so the orchestrator used mock fallback data."]
    : nextContext.meta.sourceMode === "mixed"
      ? ["Some live source fetches fell back to mock data for this run."]
      : [];
  nextContext.trace.humanReviewRequired = true;
  nextContext.meta.status = "complete";

  return nextContext;
}

function buildRenderedArtifacts(context: CampaignContext, generatedContent: GeneratedContent): GeneratedContent {
  const brand = context.brandContext;
  if (!brand) {
    return generatedContent;
  }

  const heroAsset = context.selections.selectedAssets[0];

  return {
    ...generatedContent,
    emailHtml: renderEmailHtml({
      brand,
      audience: context.selections.selectedAudience,
      products: context.selections.selectedProducts,
      heroAsset,
      strategy: context.outputs.strategy,
      content: generatedContent,
    }),
    landingPageHtml: renderLandingPageHtml({
      brand,
      audience: context.selections.selectedAudience,
      products: context.selections.selectedProducts,
      heroAsset,
      strategy: context.outputs.strategy,
      content: generatedContent,
    }),
  };
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}
