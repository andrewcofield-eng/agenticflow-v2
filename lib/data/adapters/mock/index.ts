import { mockAssets } from "@/lib/data/mock-data/assets";
import { mockAudiences } from "@/lib/data/mock-data/audiences";
import { mockProducts } from "@/lib/data/mock-data/products";

export function getMockCampaignContext() {
  return {
    audiences: mockAudiences,
    products: mockProducts,
    assets: mockAssets,
  };
}
