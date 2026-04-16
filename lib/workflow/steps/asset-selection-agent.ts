import type { Asset } from "@/lib/types/asset";
import type { CampaignContext } from "@/lib/types/orchestrator";
import type { WorkflowStepResult } from "@/lib/types/workflow";

type AssetStepData = {
  selectedAssets: Asset[];
};

export function runAssetSelectionAgent(context: CampaignContext): WorkflowStepResult<AssetStepData> {
  const audience = context.selections.selectedAudience;
  const selectedProductNames = context.selections.selectedProducts.map((product) => product.name);
  const channel = context.input.selectedChannelEmphasis?.toLowerCase() ?? context.input.selectedTheme?.toLowerCase() ?? "";
  const goal = context.input.campaignGoal.toLowerCase();

  const scored = context.candidates.assets.map((asset) => {
    let score = 0;
    const reasons: string[] = [];

    if (asset.associatedProducts.some((productName) => selectedProductNames.includes(productName))) {
      score += 4;
      reasons.push("Asset is associated with a selected product");
    }

    if (audience && asset.audienceFit.includes(audience.name)) {
      score += 3;
      reasons.push("Asset metadata fits the recommended audience");
    }

    if (channel && asset.channelSuitability.some((value) => value.toLowerCase().includes(channel.split(" ")[0]))) {
      score += 2;
      reasons.push("Asset suits the selected channel emphasis");
    }

    if (asset.campaignFit.some((value) => goal.includes(value.toLowerCase()) || value.toLowerCase().includes(goal.split(" ")[0]))) {
      score += 2;
      reasons.push("Asset campaign fit aligns with the campaign goal");
    }

    if (asset.usageStatus.toLowerCase() === "approved") {
      score += 1;
      reasons.push("Asset is marked approved for use");
    }

    return { asset, score, reasons };
  });

  const selectedAssets = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.asset);

  const topReasons = uniqueStrings(
    [...scored].sort((a, b) => b.score - a.score).slice(0, 3).flatMap((item) => item.reasons.slice(0, 2)),
  );

  return {
    stepId: "asset-selection-agent",
    stepName: "Asset Selection Agent",
    status: "complete",
    inputSummary: [
      `Recommended audience: ${audience?.name ?? "None"}`,
      `Selected product focus: ${context.input.selectedProductOrCategory}`,
      `Recommended products carried into this step: ${context.selections.selectedProducts.length}`,
      `Candidates considered: ${context.candidates.assets.length}`,
    ],
    outputSummary: [
      `Recommended assets: ${selectedAssets.length}`,
      ...selectedAssets.map((asset, index) => `${index + 1}. ${asset.title}`),
    ],
    reasoning: topReasons.length > 0 ? topReasons : ["Assets were selected using product, audience, and channel fit metadata."],
    assumptions: ["Asset fit is based on simplified metadata rather than real creative performance."],
    confidence: "medium",
    data: {
      selectedAssets,
    },
  };
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}
