import { clearCachedValue, getCachedValue, setCachedValue } from "@/lib/adapters/adapter-cache";
import type { AssetRecord, ProductRecord, SourceLoadResult } from "@/lib/adapters/adapter-types";
import { getDirectusProducts } from "@/lib/adapters/directus-adapter";
import { mockAssets } from "@/lib/data/mock-data/assets";

const CLOUDINARY_ASSETS_CACHE_KEY = "cloudinary:assets";
const CLOUDINARY_ASSETS_TTL_MS = 300_000;
const DEFAULT_CLOUDINARY_CLOUD_NAME = "dp0cdq8bj";
const LIFESTYLE_CHANNELS = ["email", "social", "landing-page", "paid-social"];

type CloudinaryManifestAsset = {
  publicId: string;
  assetType?: string;
  theme?: string;
  skuCodes: string[];
};

const cloudinaryManifest: CloudinaryManifestAsset[] = [
  { publicId: "HOD-001_ACC_001City_street_heelsWoman_w18vkt", skuCodes: ["HOD-001", "ACC-001"] },
  { publicId: "HOD-001_ACC_001Rooftopcouple_oh5qrh", skuCodes: ["HOD-001", "ACC-001"] },
  { publicId: "HOD-001_ACC_001wallWoman_a0mjrd", skuCodes: ["HOD-001", "ACC-001"] },
  { publicId: "HOD-001_ACC_001carhoodcouple_jboayc", skuCodes: ["HOD-001", "ACC-001"] },
  { publicId: "HOD-001_ACC_001Rooftop_man_thivq3", skuCodes: ["HOD-001", "ACC-001"] },
  { publicId: "KNIT-001coffeeshopMan_rvhsik", skuCodes: ["KNIT-001"] },
  { publicId: "OUT-001RainStreetwoman_zyssut", skuCodes: ["OUT-001"] },
  { publicId: "OUT-002_KNIT-001_DNM-003_ACC-002stepsman_pvdcbn", skuCodes: ["OUT-002", "KNIT-001", "DNM-003", "ACC-002"] },
  { publicId: "urbanthreads-PrimaryLogo-DKbkgrd_dbzktr", skuCodes: [], assetType: "logo", theme: "dark" },
  { publicId: "urbanthreads-PrimaryLogo-LTbkgrd_q1hdpt", skuCodes: [], assetType: "logo", theme: "light" },
  { publicId: "image-img_01kmtgh0jtey4sgqqky0hjc0zh_cshocs", skuCodes: [], assetType: "texture" },
];

export async function getCloudinaryAssets(options?: { forceRefresh?: boolean }): Promise<SourceLoadResult<AssetRecord>> {
  if (!options?.forceRefresh) {
    const cached = getCachedValue<SourceLoadResult<AssetRecord>>(CLOUDINARY_ASSETS_CACHE_KEY);
    if (cached) {
      return cached.value;
    }
  }

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || DEFAULT_CLOUDINARY_CLOUD_NAME;
    const directusProducts = await getDirectusProducts({ forceRefresh: options?.forceRefresh });

    if (directusProducts.mode !== "live") {
      throw new Error(directusProducts.warning ?? "Directus products unavailable for Cloudinary SKU-to-name resolution.");
    }

    const skuToProductName = buildSkuToProductNameMap(directusProducts.records);
    const records = cloudinaryManifest.map((asset) => normalizeManifestAsset(asset, cloudName, skuToProductName));

    const unresolvedAssets = records.filter((asset, index) => cloudinaryManifest[index].skuCodes.length > 0 && asset.associatedProducts.length === 0);
    if (unresolvedAssets.length > 0) {
      throw new Error("Cloudinary asset normalization could not resolve product names from Directus records.");
    }

    const result: SourceLoadResult<AssetRecord> = {
      records,
      source: "cloudinary",
      mode: "live",
      lastRefreshed: new Date().toISOString(),
    };

    setCachedValue(CLOUDINARY_ASSETS_CACHE_KEY, result, CLOUDINARY_ASSETS_TTL_MS);
    return result;
  } catch (error) {
    const result: SourceLoadResult<AssetRecord> = {
      records: mockAssets.map(normalizeMockAsset),
      source: "cloudinary",
      mode: "mock",
      lastRefreshed: new Date().toISOString(),
      warning: error instanceof Error ? error.message : "Cloudinary asset load failed.",
    };

    setCachedValue(CLOUDINARY_ASSETS_CACHE_KEY, result, CLOUDINARY_ASSETS_TTL_MS);
    return result;
  }
}

export function clearCloudinaryAssetsCache() {
  clearCachedValue(CLOUDINARY_ASSETS_CACHE_KEY);
}

function normalizeManifestAsset(
  asset: CloudinaryManifestAsset,
  cloudName: string,
  skuToProductName: Map<string, string>,
): AssetRecord {
  const skuCodes = asset.skuCodes.length > 0 ? asset.skuCodes : extractSkuCodes(asset.publicId);
  const associatedProducts = skuCodes
    .map((skuCode) => skuToProductName.get(skuCode))
    .filter((name): name is string => Boolean(name));

  const assetType = asset.assetType ?? "lifestyle";
  const tags = [...skuCodes, assetType, "premium-urban"];
  if (asset.theme) {
    tags.push(asset.theme);
  }

  return {
    id: asset.publicId,
    title: humanizePublicId(asset.publicId),
    assetType,
    tags,
    associatedProducts,
    audienceFit: associatedProducts.length > 0 ? associatedProducts : ["Brand audience"],
    channelSuitability: assetType === "lifestyle" ? [...LIFESTYLE_CHANNELS] : ["landing-page", "email"],
    toneStyle: "premium-urban",
    usageStatus: "approved",
    campaignFit: assetType === "lifestyle" ? ["awareness", "launch", "seasonal"] : ["brand"],
    imageUrl: buildCloudinaryUrl(cloudName, asset.publicId),
    publicId: asset.publicId,
  };
}

function normalizeMockAsset(asset: typeof mockAssets[number]): AssetRecord {
  return {
    id: asset.id,
    title: asset.title,
    assetType: asset.assetType,
    tags: asset.tags,
    associatedProducts: asset.associatedProducts,
    audienceFit: asset.audienceFit,
    channelSuitability: asset.channelSuitability,
    toneStyle: asset.toneStyle,
    usageStatus: asset.usageStatus.toLowerCase(),
    campaignFit: asset.campaignFit,
  };
}

function buildSkuToProductNameMap(products: ProductRecord[]) {
  return new Map(products.map((product) => [product.id, product.name]));
}

function extractSkuCodes(publicId: string) {
  const matches = publicId.match(/[A-Z]+-\d{3}/g);
  return matches ? Array.from(new Set(matches)) : [];
}

function buildCloudinaryUrl(cloudName: string, publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`;
}

function humanizePublicId(publicId: string) {
  return publicId
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
