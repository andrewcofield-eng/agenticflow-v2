import type { Asset } from "@/lib/types/asset";
import type { Audience } from "@/lib/types/audience";
import type { BrandContext } from "@/lib/types/brand";
import type { CampaignInput, GeneratedContent, ReviewSummary, StrategyOutput } from "@/lib/types/campaign";
import type { Product } from "@/lib/types/product";
import type { OrchestratorStatus, WorkflowStepResult } from "@/lib/types/workflow";

export type SourceMode = "mock" | "live" | "mixed";

export type CampaignContext = {
  input: CampaignInput;
  candidates: {
    audiences: Audience[];
    products: Product[];
    assets: Asset[];
  };
  brandContext?: BrandContext;
  brandSourceMode?: "live" | "mock";
  selections: {
    selectedAudience?: Audience;
    selectedProducts: Product[];
    selectedAssets: Asset[];
  };
  outputs: {
    strategy?: StrategyOutput;
    generatedContent?: GeneratedContent;
    reviewSummary?: ReviewSummary;
  };
  trace: {
    workflowSteps: WorkflowStepResult[];
    assumptions: string[];
    warnings: string[];
    humanReviewRequired: boolean;
  };
  meta: {
    sourceMode: SourceMode;
    generatedAt: string;
    status: OrchestratorStatus;
  };
};
