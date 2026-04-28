import type { BrandContext } from "@/lib/types/brand";

export type DataSourceKind = "directus" | "cloudinary" | "hubspot" | "brand";

export type DataSourceMode = "live" | "mock";

export type ProductRecord = {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  targetUseCase: string;
  audienceFitTags: string[];
  verticalFit: string[];
  valueTier: string;
  bundleRole: string;
  complementarySkus: string[];
  ctaAngle: string;
  eventFit: string;
  giftingFit: string;
  onboardingFit: string;
  lifecycleStatus: string;
  description: string;
  shortDescription: string;
};

export type AssetRecord = {
  id: string;
  title: string;
  assetType: string;
  tags: string[];
  associatedProducts: string[];
  audienceFit: string[];
  channelSuitability: string[];
  toneStyle: string;
  usageStatus: string;
  campaignFit: string[];
  imageUrl?: string;
  publicId?: string;
};

export type AudienceSegment = {
  id: string;
  name: string;
  lifecycleStage: string;
  description: string;
  size: string;
  engagementLevel: string;
  intentSignals: string[];
  estimatedValue: string;
  region: string;
  productInterestTags: string[];
  industry?: string;
  contactName?: string;
  useCase?: string;
  buyingStage?: string;
  abmScore?: number;
};

export type BrandSummary = {
  brandName: string;
  logoCount: number;
  colorCount: number;
  typographyCount: number;
  toneAttributes: string[];
};

export type SourceLoadResult<T> = {
  records: T[];
  source: DataSourceKind;
  mode: DataSourceMode;
  lastRefreshed: string;
  warning?: string;
  context?: BrandContext;
};

export type SourceStatus = {
  source: DataSourceKind;
  mode: DataSourceMode;
  count: number;
  lastRefreshed: string;
  warning?: string;
};
