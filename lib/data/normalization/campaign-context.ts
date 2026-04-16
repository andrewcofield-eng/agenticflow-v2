import type { Asset } from "@/lib/types/asset";
import type { Audience } from "@/lib/types/audience";
import type { CampaignInput } from "@/lib/types/campaign";
import type { CampaignContext, SourceMode } from "@/lib/types/orchestrator";
import type { Product } from "@/lib/types/product";

type CreateCampaignContextInput = {
  input: CampaignInput;
  audiences: Audience[];
  products: Product[];
  assets: Asset[];
  sourceMode?: SourceMode;
};

export function createCampaignContext({
  input,
  audiences,
  products,
  assets,
  sourceMode = "mock",
}: CreateCampaignContextInput): CampaignContext {
  return {
    input,
    candidates: {
      audiences,
      products,
      assets,
    },
    selections: {
      selectedProducts: [],
      selectedAssets: [],
    },
    outputs: {},
    trace: {
      workflowSteps: [],
      assumptions: [],
      warnings: [],
      humanReviewRequired: true,
    },
    meta: {
      sourceMode,
      generatedAt: new Date().toISOString(),
      status: "assembling-context",
    },
  };
}
