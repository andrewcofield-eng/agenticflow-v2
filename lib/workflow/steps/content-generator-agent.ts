import type { GeneratedContent } from "@/lib/types/campaign";
import type { CampaignContext } from "@/lib/types/orchestrator";
import type { WorkflowStepResult } from "@/lib/types/workflow";

type ContentStepData = {
  generatedContent: GeneratedContent;
};

export function runContentGeneratorAgent(context: CampaignContext): WorkflowStepResult<ContentStepData> {
  const generatedContent = buildPlaceholderContent(context);

  return createCompletedContentStep(context, generatedContent);
}

export function createPendingContentStep(context: CampaignContext): WorkflowStepResult<ContentStepData> {
  const strategy = context.outputs.strategy;
  const audience = context.selections.selectedAudience;
  const products = context.selections.selectedProducts.map((product) => product.name).join(", ");

  return {
    stepId: "content-generator-agent",
    stepName: "Content Generator",
    status: "running",
    inputSummary: [
      `Campaign angle: ${strategy?.campaignAngle ?? "None"}`,
      `Audience: ${audience?.name ?? "None"}`,
      `Products: ${products || "None"}`,
    ],
    outputSummary: ["Generating AI-assisted content draft"],
    reasoning: ["The content generator is using the selected audience, products, strategy, and CTA to prepare channel-specific drafts."],
    assumptions: [],
    confidence: "medium",
    data: {
      generatedContent: buildPlaceholderContent(context),
    },
  };
}

export function createCompletedContentStep(
  context: CampaignContext,
  generatedContent: GeneratedContent,
): WorkflowStepResult<ContentStepData> {
  const strategy = context.outputs.strategy;
  const audience = context.selections.selectedAudience;
  const products = context.selections.selectedProducts.map((product) => product.name).join(", ");

  return {
    stepId: "content-generator-agent",
    stepName: "Content Generator",
    status: "complete",
    inputSummary: [
      `Campaign angle: ${strategy?.campaignAngle ?? "None"}`,
      `Audience: ${audience?.name ?? "None"}`,
      `Products: ${products || "None"}`,
    ],
    outputSummary: ["Email subject and body drafted", "Social post drafted", "Paid ad copy drafted"],
    reasoning: [
      "Content is derived from the orchestrator-selected audience, products, strategy, and CTA.",
      generatedContent.source === "ai-generated"
        ? "This pass uses direct OpenAI generation with a marketing-focused prompt."
        : "This pass used the placeholder fallback because AI generation was unavailable.",
    ],
    assumptions: [generatedContent.source === "ai-generated"
      ? "AI-generated drafts should still be reviewed for brand tone and factual accuracy."
      : "Content tone and phrasing are placeholders and should be human-edited before real use."],
    confidence: "medium",
    data: {
      generatedContent,
    },
  };
}

export function buildPlaceholderContent(context: CampaignContext): GeneratedContent {
  const strategy = context.outputs.strategy;
  const audience = context.selections.selectedAudience;
  const products = context.selections.selectedProducts.map((product) => product.name).join(", ");

  return {
    emailSubject: `${audience?.name ?? "Your team"}: a smarter way to move this campaign forward`,
    emailBody: `This mock draft shows how AgenticFlow can turn connected audience, product, and asset context into a guided campaign package. In this version, the campaign highlights ${products || "the selected products"} with a strategy focused on ${strategy?.campaignAngle ?? "clear audience-fit messaging"}. CTA: ${strategy?.ctaRecommendation ?? "See how it works"}.`,
    socialPost: `A connected campaign starts with connected context. This draft targets ${audience?.name ?? "a priority audience"} and highlights ${products || "the selected offer"} with a message built for faster relevance and clearer review.`,
    adHeadline: `Built for ${audience?.name ?? "your next campaign"}`,
    adCopy: "Use connected audience, product, and asset context to assemble a more relevant campaign package with clearer rationale and supervised review.",
    source: "placeholder",
    temperature: 0.7,
  };
}
