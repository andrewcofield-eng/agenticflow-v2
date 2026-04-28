import { clearAllCachedValues } from "@/lib/adapters/adapter-cache";
import { getBrandGuidelines } from "@/lib/adapters/brand-guidelines-adapter";
import { getCloudinaryAssets } from "@/lib/adapters/cloudinary-adapter";
import { getDirectusProducts } from "@/lib/adapters/directus-adapter";
import { getHubSpotAudiences } from "@/lib/adapters/hubspot-adapter";
import type { AssetRecord, AudienceSegment, BrandSummary, ProductRecord, SourceStatus } from "@/lib/adapters/adapter-types";
import { getMockCampaignContext } from "@/lib/data/adapters/mock";
import { mockBrandContext } from "@/lib/data/mock-data/brand-guidelines";
import type { Asset } from "@/lib/types/asset";
import type { Audience } from "@/lib/types/audience";
import type { BrandContext } from "@/lib/types/brand";
import type { SourceMode } from "@/lib/types/orchestrator";
import type { Product } from "@/lib/types/product";

export type SourceContextPayload = {
  candidates: {
    products: Product[];
    assets: Asset[];
    audiences: Audience[];
  };
  normalized: {
    products: ProductRecord[];
    assets: AssetRecord[];
    audiences: AudienceSegment[];
    brand: BrandSummary;
  };
  brandContext: BrandContext;
  sourceMode: SourceMode;
  sourceStatuses: SourceStatus[];
  recordCounts: {
    products: number;
    assets: number;
    audiences: number;
    brand: number;
  };
  lastRefreshed: string;
};

export async function getSourceContext(options?: { forceRefresh?: boolean }): Promise<SourceContextPayload> {
  const useLiveData = process.env.USE_LIVE_DATA === "true";

  if (!useLiveData) {
    return buildMockSourceContext();
  }

  const productsResult = await getDirectusProducts({ forceRefresh: options?.forceRefresh });
  const assetsResult = await getCloudinaryAssets({ forceRefresh: options?.forceRefresh });
  const audiencesResult = await getHubSpotAudiences({ forceRefresh: options?.forceRefresh });
  const brandResult = await getBrandGuidelines({ forceRefresh: options?.forceRefresh });

  const sourceStatuses: SourceStatus[] = [
    {
      source: productsResult.source,
      mode: productsResult.mode,
      count: productsResult.records.length,
      lastRefreshed: productsResult.lastRefreshed,
      warning: productsResult.warning,
    },
    {
      source: assetsResult.source,
      mode: assetsResult.mode,
      count: assetsResult.records.length,
      lastRefreshed: assetsResult.lastRefreshed,
      warning: assetsResult.warning,
    },
    {
      source: audiencesResult.source,
      mode: audiencesResult.mode,
      count: audiencesResult.records.length,
      lastRefreshed: audiencesResult.lastRefreshed,
      warning: audiencesResult.warning,
    },
    {
      source: brandResult.source,
      mode: brandResult.mode,
      count: brandResult.records.length,
      lastRefreshed: brandResult.lastRefreshed,
      warning: brandResult.warning,
    },
  ];

  return {
    candidates: {
      products: productsResult.records.map(mapProductRecordToProduct),
      assets: assetsResult.records.map(mapAssetRecordToAsset),
      audiences: audiencesResult.records.map(mapAudienceSegmentToAudience),
    },
    normalized: {
      products: productsResult.records,
      assets: assetsResult.records,
      audiences: audiencesResult.records,
      brand: brandResult.records[0] ?? buildBrandSummary(mockBrandContext),
    },
    brandContext: brandResult.context ?? mockBrandContext,
    sourceMode: determineSourceMode(sourceStatuses),
    sourceStatuses,
    recordCounts: {
      products: productsResult.records.length,
      assets: assetsResult.records.length,
      audiences: audiencesResult.records.length,
      brand: brandResult.records.length,
    },
    lastRefreshed: latestTimestamp(sourceStatuses.map((status) => status.lastRefreshed)),
  };
}

export async function refreshSourceContext() {
  clearAllCachedValues();
  return getSourceContext({ forceRefresh: true });
}

function buildMockSourceContext(): SourceContextPayload {
  const mockContext = getMockCampaignContext();
  const now = new Date().toISOString();

  return {
    candidates: {
      products: mockContext.products,
      assets: mockContext.assets,
      audiences: mockContext.audiences,
    },
    normalized: {
      products: mockContext.products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: 0,
        imageUrl: "",
        targetUseCase: product.targetUseCase,
        audienceFitTags: product.audienceFitTags,
        verticalFit: product.messagingThemes,
        valueTier: product.priceTier,
        bundleRole: "Standalone",
        complementarySkus: [],
        ctaAngle: "",
        eventFit: "Unknown",
        giftingFit: "Unknown",
        onboardingFit: "Unknown",
        lifecycleStatus: product.lifecycleStatus,
        description: [...product.features, ...product.benefits].join(". "),
        shortDescription: product.subcategory,
      })),
      assets: mockContext.assets.map((asset) => ({
        id: asset.id,
        title: asset.title,
        assetType: asset.assetType,
        tags: asset.tags,
        associatedProducts: asset.associatedProducts,
        audienceFit: asset.audienceFit,
        channelSuitability: asset.channelSuitability,
        toneStyle: asset.toneStyle,
        usageStatus: asset.usageStatus,
        campaignFit: asset.campaignFit,
      })),
      audiences: mockContext.audiences.map((audience) => ({
        id: audience.id,
        name: audience.name,
        lifecycleStage: audience.lifecycleStage,
        description: audience.description,
        size: audience.size,
        engagementLevel: audience.engagementLevel,
        intentSignals: audience.intentSignals,
        estimatedValue: audience.estimatedValue,
        region: audience.region,
        productInterestTags: audience.productInterestTags,
      })),
      brand: buildBrandSummary(mockBrandContext),
    },
    brandContext: mockBrandContext,
    sourceMode: "mock",
    sourceStatuses: [
      { source: "directus", mode: "mock", count: mockContext.products.length, lastRefreshed: now },
      { source: "cloudinary", mode: "mock", count: mockContext.assets.length, lastRefreshed: now },
      { source: "hubspot", mode: "mock", count: mockContext.audiences.length, lastRefreshed: now },
      { source: "brand", mode: "mock", count: 1, lastRefreshed: now },
    ],
    recordCounts: {
      products: mockContext.products.length,
      assets: mockContext.assets.length,
      audiences: mockContext.audiences.length,
      brand: 1,
    },
    lastRefreshed: now,
  };
}

function determineSourceMode(statuses: SourceStatus[]): SourceMode {
  const modes = new Set(statuses.map((status) => status.mode));

  if (modes.size === 1 && modes.has("live")) {
    return "live";
  }

  if (modes.size === 1 && modes.has("mock")) {
    return "mock";
  }

  return "mixed";
}

function latestTimestamp(values: string[]) {
  return [...values].sort().at(-1) ?? new Date().toISOString();
}

function mapProductRecordToProduct(record: ProductRecord): Product {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    subcategory: record.shortDescription || record.category,
    features: record.shortDescription ? [record.shortDescription] : [],
    benefits: record.description ? [record.description] : [],
    priceTier: record.valueTier,
    targetUseCase: record.targetUseCase,
    audienceFitTags: record.audienceFitTags,
    messagingThemes: record.verticalFit,
    lifecycleStatus: record.lifecycleStatus,
  };
}

function mapAssetRecordToAsset(record: AssetRecord): Asset {
  return {
    id: record.id,
    title: record.title,
    assetType: record.assetType,
    tags: record.tags,
    associatedProducts: record.associatedProducts,
    audienceFit: record.audienceFit,
    channelSuitability: record.channelSuitability,
    toneStyle: record.toneStyle,
    usageStatus: record.usageStatus,
    campaignFit: record.campaignFit,
  };
}

function mapAudienceSegmentToAudience(record: AudienceSegment): Audience {
  return {
    id: record.id,
    name: record.name,
    lifecycleStage: record.lifecycleStage,
    description: record.description,
    size: record.size,
    engagementLevel: record.engagementLevel,
    intentSignals: record.intentSignals,
    estimatedValue: record.estimatedValue,
    region: record.region,
    productInterestTags: record.productInterestTags,
  };
}

function buildBrandSummary(context: BrandContext): BrandSummary {
  return {
    brandName: context.brandName,
    logoCount: context.logos.length,
    colorCount: context.colors.length,
    typographyCount: context.typography.length,
    toneAttributes: context.voice.toneAttributes,
  };
}
