import type { Asset } from "@/lib/types/asset";
import type { Audience } from "@/lib/types/audience";
import type { BrandContext } from "@/lib/types/brand";
import type { CampaignInput } from "@/lib/types/campaign";
import type { CampaignContext, SourceMode } from "@/lib/types/orchestrator";
import type { Product } from "@/lib/types/product";

type CreateCampaignContextInput = {
  input: CampaignInput;
  audiences: Audience[];
  products: Product[];
  assets: Asset[];
  brandContext?: BrandContext;
  brandSourceMode?: "live" | "mock";
  sourceMode?: SourceMode;
};

export function createCampaignContext({
  input,
  audiences,
  products,
  assets,
  brandContext,
  brandSourceMode = "mock",
  sourceMode = "mock",
}: CreateCampaignContextInput): CampaignContext {
  return {
    input,
    candidates: {
      audiences,
      products,
      assets,
    },
    brandContext,
    brandSourceMode,
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
