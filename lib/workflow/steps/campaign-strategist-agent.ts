import type { StrategyOutput } from "@/lib/types/campaign";
import type { CampaignContext } from "@/lib/types/orchestrator";
import type { WorkflowStepResult } from "@/lib/types/workflow";

type StrategyStepData = {
  strategy: StrategyOutput;
};

export function runCampaignStrategistAgent(context: CampaignContext): WorkflowStepResult<StrategyStepData> {
  const audience = context.selections.selectedAudience;
  const primaryProduct = context.selections.selectedProducts[0];
  const productNames = context.selections.selectedProducts.map((product) => product.name).join(", ");
  const theme = context.input.selectedTheme ?? "Balanced multi-channel mix";
  const channelMix = inferChannelMix(context.input.selectedChannelEmphasis ?? theme);

  const strategy: StrategyOutput = {
    campaignName: `${context.input.campaignGoal} for ${audience?.name ?? "priority audience"}`,
    campaignAngle: `Show how ${primaryProduct?.name ?? "the selected solution"} helps ${audience?.name ?? "this audience"} act faster with less friction.`,
    valueProposition: `Connect the right audience, product, and brand assets to create a campaign that feels more relevant and easier to act on.`,
    ctaRecommendation: goalToCta(context.input.campaignGoal),
    suggestedChannelMix: channelMix,
    strategyRationale: [
      `The strategy centers on ${audience?.name ?? "the chosen audience"} because it had the strongest fit score in the orchestration flow.`,
      `Messaging highlights ${productNames || "the selected products"} because those products ranked highest for audience and goal alignment.`,
      `The recommended channel mix is framed from the selected theme and available asset suitability data.`,
      `This strategy draft uses connected source context to frame the campaign angle, channel mix, and CTA recommendation.`,
    ],
  };

  return {
    stepId: "campaign-strategist-agent",
    stepName: "Campaign Strategist",
    status: "complete",
    inputSummary: [
      `Audience: ${audience?.name ?? "None"}`,
      `Selected product/category input: ${context.input.selectedProductOrCategory}`,
      `Recommended products: ${context.selections.selectedProducts.length}`,
      `Recommended assets: ${context.selections.selectedAssets.length}`,
    ],
    outputSummary: [
      `Campaign name: ${strategy.campaignName}`,
      `CTA: ${strategy.ctaRecommendation}`,
      `Channels: ${strategy.suggestedChannelMix.join(", ")}`,
    ],
    reasoning: strategy.strategyRationale,
    assumptions: ["Strategy wording is generated as a source-aware draft for human review."],
    confidence: "medium",
    data: {
      strategy,
    },
  };
}

function inferChannelMix(themeOrChannel: string): string[] {
  const value = themeOrChannel.toLowerCase();

  if (value.includes("email")) return ["Email", "Landing page"];
  if (value.includes("linkedin") || value.includes("social")) return ["LinkedIn", "Paid social"];
  if (value.includes("seasonal") || value.includes("launch")) return ["Email", "LinkedIn", "Paid social"];

  return ["Email", "LinkedIn", "Paid social"];
}

function goalToCta(goal: string): string {
  const value = goal.toLowerCase();

  if (value.includes("upsell")) return "Explore the expansion package";
  if (value.includes("re-engage")) return "Reconnect with the solution";
  if (value.includes("launch")) return "See what is new";

  return "See how it works";
}
