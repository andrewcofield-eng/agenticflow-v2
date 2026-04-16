import type { Asset } from "@/lib/types/asset";
import type { Audience } from "@/lib/types/audience";
import type { Product } from "@/lib/types/product";

export type CampaignContext = {
  audiences: Audience[];
  products: Product[];
  assets: Asset[];
};

export function createCampaignContext(input: CampaignContext): CampaignContext {
  return input;
}
