import { mockAssets } from "@/lib/data/mock-data/assets";
import { mockAudiences } from "@/lib/data/mock-data/audiences";
import { mockProducts } from "@/lib/data/mock-data/products";
import { createCampaignContext } from "@/lib/data/normalization/campaign-context";

export function getMockCampaignContext() {
  return createCampaignContext({
    audiences: mockAudiences,
    products: mockProducts,
    assets: mockAssets,
  });
}
