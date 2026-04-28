import { getCachedValue, setCachedValue, clearCachedValue } from "@/lib/adapters/adapter-cache";
import type { ProductRecord, SourceLoadResult } from "@/lib/adapters/adapter-types";
import { mockProducts } from "@/lib/data/mock-data/products";

const DIRECTUS_PRODUCTS_CACHE_KEY = "directus:products";
const DIRECTUS_PRODUCTS_TTL_MS = 120_000;
const DEFAULT_DIRECTUS_URL = "https://directus-production-9f53.up.railway.app";

type DirectusProduct = {
  sku?: string | null;
  name?: string | null;
  product_name?: string | null;
  category?: string | null;
  price?: string | number | null;
  cloudinary_url?: string | null;
  af_primary_use_case?: string | null;
  af_ideal_audience?: string[] | string | null;
  af_vertical_fit?: string[] | string | null;
  af_value_tier?: string | null;
  af_event_fit?: string | null;
  af_gifting_fit?: string | null;
  af_onboarding_fit?: string | null;
  af_personalization_suitability?: string | null;
  af_recommended_cta_angle?: string | null;
  af_bundle_role?: string | null;
  af_complementary_skus?: string[] | string | null;
  status?: string | null;
  Description?: string | null;
  description?: string | null;
  short_description?: string | null;
};

type DirectusProductsResponse = {
  data?: DirectusProduct[];
};

export async function getDirectusProducts(options?: { forceRefresh?: boolean }): Promise<SourceLoadResult<ProductRecord>> {
  if (!options?.forceRefresh) {
    const cached = getCachedValue<SourceLoadResult<ProductRecord>>(DIRECTUS_PRODUCTS_CACHE_KEY);
    if (cached) {
      return cached.value;
    }
  }

  try {
    const baseUrl = (process.env.DIRECTUS_URL?.trim() || DEFAULT_DIRECTUS_URL).replace(/\/$/, "");
    const token = process.env.DIRECTUS_TOKEN?.trim();
    const url = `${baseUrl}/items/products?limit=100`;
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Directus request failed with status ${response.status}`);
    }

    const payload = await response.json() as DirectusProductsResponse;
    const records = (payload.data ?? []).map(normalizeDirectusProduct);

    const result: SourceLoadResult<ProductRecord> = {
      records,
      source: "directus",
      mode: "live",
      lastRefreshed: new Date().toISOString(),
    };

    setCachedValue(DIRECTUS_PRODUCTS_CACHE_KEY, result, DIRECTUS_PRODUCTS_TTL_MS);
    return result;
  } catch (error) {
    const result: SourceLoadResult<ProductRecord> = {
      records: mockProducts.map(normalizeMockProduct),
      source: "directus",
      mode: "mock",
      lastRefreshed: new Date().toISOString(),
      warning: error instanceof Error ? error.message : "Directus fetch failed.",
    };

    setCachedValue(DIRECTUS_PRODUCTS_CACHE_KEY, result, DIRECTUS_PRODUCTS_TTL_MS);
    return result;
  }
}

export function clearDirectusProductsCache() {
  clearCachedValue(DIRECTUS_PRODUCTS_CACHE_KEY);
}

export function normalizeDirectusProduct(product: DirectusProduct): ProductRecord {
  return {
    id: safeString(product.sku, "unknown-sku"),
    name: safeString(product.product_name ?? product.name, "Unnamed product"),
    category: safeString(product.category, "Uncategorized"),
    price: parsePrice(product.price),
    imageUrl: safeString(product.cloudinary_url),
    targetUseCase: safeString(product.af_primary_use_case, "General"),
    audienceFitTags: toStringArray(product.af_ideal_audience),
    verticalFit: toStringArray(product.af_vertical_fit),
    valueTier: safeString(product.af_value_tier, "Mid-Range"),
    bundleRole: safeString(product.af_bundle_role, "Standalone"),
    complementarySkus: toStringArray(product.af_complementary_skus),
    ctaAngle: safeString(product.af_recommended_cta_angle),
    eventFit: safeString(product.af_event_fit, "Unknown"),
    giftingFit: safeString(product.af_gifting_fit, "Unknown"),
    onboardingFit: safeString(product.af_onboarding_fit, "Unknown"),
    lifecycleStatus: safeString(product.status, "Unknown"),
    description: safeString(product.Description ?? product.description),
    shortDescription: safeString(product.short_description),
  };
}

function normalizeMockProduct(product: typeof mockProducts[number]): ProductRecord {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: 0,
    imageUrl: "",
    targetUseCase: product.targetUseCase || "General",
    audienceFitTags: product.audienceFitTags ?? [],
    verticalFit: product.messagingThemes ?? [],
    valueTier: product.priceTier || "Mid-Range",
    bundleRole: "Standalone",
    complementarySkus: [],
    ctaAngle: "",
    eventFit: "Unknown",
    giftingFit: "Unknown",
    onboardingFit: "Unknown",
    lifecycleStatus: product.lifecycleStatus || "Unknown",
    description: [...(product.features ?? []), ...(product.benefits ?? [])].join(". "),
    shortDescription: product.subcategory || "",
  };
}

function parsePrice(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const normalized = value.replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStringArray(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value
      .map((item) => item?.toString().trim())
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function safeString(value: string | null | undefined, fallback = "") {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}
