import type { Product } from "@/lib/types/product";
import type { CampaignContext } from "@/lib/types/orchestrator";
import type { WorkflowStepResult } from "@/lib/types/workflow";

type ProductStepData = {
  selectedProducts: Product[];
};

export function runProductMatchAgent(context: CampaignContext): WorkflowStepResult<ProductStepData> {
  const audience = context.selections.selectedAudience;
  const productFocus = context.input.selectedProductOrCategory.toLowerCase();
  const goal = context.input.campaignGoal.toLowerCase();
  const theme = context.input.selectedTheme?.toLowerCase() ?? "";

  const scored = context.candidates.products.map((product) => {
    let score = 0;
    const reasons: string[] = [];

    if (
      product.name.toLowerCase().includes(productFocus) ||
      product.category.toLowerCase().includes(productFocus) ||
      productFocus.includes(product.name.toLowerCase())
    ) {
      score += 5;
      reasons.push("Direct match with selected product or category focus");
    }

    const audienceTags = audience?.productInterestTags ?? [];
    if (product.audienceFitTags.some((tag) => audienceTags.includes(tag))) {
      score += 3;
      reasons.push("Strong overlap with audience interest tags");
    }

    if (goal.includes("upsell") && product.targetUseCase.toLowerCase().includes("existing customer")) {
      score += 3;
      reasons.push("Target use case supports an upsell campaign");
    }

    if (goal.includes("launch") && product.lifecycleStatus.toLowerCase().includes("new")) {
      score += 2;
      reasons.push("Product status supports a launch-style campaign");
    }

    if (theme && product.messagingThemes.some((item) => item.toLowerCase().includes(theme.split(" ")[0]))) {
      score += 1;
      reasons.push("Messaging themes loosely align with the selected theme");
    }

    return { product, score, reasons };
  });

  const selectedProducts = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.product);

  const topReasons = uniqueStrings(
    [...scored].sort((a, b) => b.score - a.score).slice(0, 3).flatMap((item) => item.reasons.slice(0, 2)),
  );

  return {
    stepId: "product-match-agent",
    stepName: "Product Match Agent",
    status: "complete",
    inputSummary: [
      `Recommended audience: ${audience?.name ?? "None"}`,
      `Candidates considered: ${context.candidates.products.length}`,
      `Product focus: ${context.input.selectedProductOrCategory}`,
    ],
    outputSummary: [
      `Recommended products: ${selectedProducts.length}`,
      ...selectedProducts.map((product, index) => `${index + 1}. ${product.name}`),
    ],
    reasoning: topReasons.length > 0 ? topReasons : ["Products were ranked using simple fit and goal alignment rules."],
    assumptions: ["Product ranking uses lightweight tag and goal matching rather than historical performance."],
    confidence: "medium",
    data: {
      selectedProducts,
    },
  };
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}
