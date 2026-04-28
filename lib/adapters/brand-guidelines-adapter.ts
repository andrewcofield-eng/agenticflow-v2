import { clearCachedValue, getCachedValue, setCachedValue } from "@/lib/adapters/adapter-cache";
import type { BrandSummary, SourceLoadResult } from "@/lib/adapters/adapter-types";
import { mockBrandContext } from "@/lib/data/mock-data/brand-guidelines";
import type {
  BrandAssetRef,
  BrandColorToken,
  BrandContext,
  BrandCtaGuidance,
  BrandImageGuidance,
  BrandTemplateTokens,
  BrandTypographyToken,
  BrandVoiceGuideline,
} from "@/lib/types/brand";

const BRAND_GUIDELINES_CACHE_KEY = "brand:guidelines";
const BRAND_GUIDELINES_TTL_MS = 300_000;
const DEFAULT_CLOUDINARY_CLOUD_NAME = "dp0cdq8bj";
const DEFAULT_BRAND_GUIDELINES_PUBLIC_ID = "brand/urban-threads/brand-guidelines";

type RawBrandGuidelines = {
  brandName?: string | null;
  logos?: unknown;
  colors?: unknown;
  typography?: unknown;
  voice?: unknown;
  ctaGuidance?: unknown;
  imageGuidance?: unknown;
  complianceNotes?: unknown;
  templateTokens?: unknown;
};

export async function getBrandGuidelines(options?: { forceRefresh?: boolean }): Promise<SourceLoadResult<BrandSummary>> {
  if (!options?.forceRefresh) {
    const cached = getCachedValue<SourceLoadResult<BrandSummary>>(BRAND_GUIDELINES_CACHE_KEY);
    if (cached) {
      return cached.value;
    }
  }

  try {
    const sourceUrl = resolveBrandGuidelinesUrl();
    const response = await fetch(sourceUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Brand guidelines request failed with status ${response.status}`);
    }

    const payload = await response.json() as RawBrandGuidelines;
    const context = normalizeBrandGuidelines(payload, sourceUrl);

    const result: SourceLoadResult<BrandSummary> = {
      records: [buildBrandSummary(context)],
      source: "brand",
      mode: "live",
      lastRefreshed: new Date().toISOString(),
      context,
    };

    setCachedValue(BRAND_GUIDELINES_CACHE_KEY, result, BRAND_GUIDELINES_TTL_MS);
    return result;
  } catch (error) {
    const result: SourceLoadResult<BrandSummary> = {
      records: [buildBrandSummary(mockBrandContext)],
      source: "brand",
      mode: "mock",
      lastRefreshed: new Date().toISOString(),
      warning: error instanceof Error ? error.message : "Brand guidelines load failed.",
      context: mockBrandContext,
    };

    setCachedValue(BRAND_GUIDELINES_CACHE_KEY, result, BRAND_GUIDELINES_TTL_MS);
    return result;
  }
}

export function clearBrandGuidelinesCache() {
  clearCachedValue(BRAND_GUIDELINES_CACHE_KEY);
}

function resolveBrandGuidelinesUrl() {
  const explicitUrl = process.env.BRAND_GUIDELINES_URL?.trim();
  if (explicitUrl) {
    return explicitUrl;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || DEFAULT_CLOUDINARY_CLOUD_NAME;
  const publicId = process.env.CLOUDINARY_BRAND_GUIDELINES_PUBLIC_ID?.trim() || DEFAULT_BRAND_GUIDELINES_PUBLIC_ID;
  const normalizedPublicId = publicId.endsWith(".json") ? publicId : `${publicId}.json`;
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${normalizedPublicId}`;
}

function normalizeBrandGuidelines(payload: RawBrandGuidelines, sourceUrl: string): BrandContext {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || DEFAULT_CLOUDINARY_CLOUD_NAME;

  return {
    brandName: safeString(payload.brandName, mockBrandContext.brandName),
    logos: normalizeLogos(payload.logos, cloudName),
    colors: normalizeColors(payload.colors),
    typography: normalizeTypography(payload.typography),
    voice: normalizeVoice(payload.voice),
    ctaGuidance: normalizeCtaGuidance(payload.ctaGuidance),
    imageGuidance: normalizeImageGuidance(payload.imageGuidance),
    complianceNotes: toStringArray(payload.complianceNotes, mockBrandContext.complianceNotes),
    templateTokens: normalizeTemplateTokens(payload.templateTokens),
    sourceAssetId: sourceUrl,
    sourcePublicId: process.env.CLOUDINARY_BRAND_GUIDELINES_PUBLIC_ID?.trim() || DEFAULT_BRAND_GUIDELINES_PUBLIC_ID,
  };
}

function normalizeLogos(value: unknown, cloudName: string): BrandAssetRef[] {
  if (!Array.isArray(value)) {
    return mockBrandContext.logos;
  }

  const logos = value
    .map((entry, index) => normalizeLogo(entry, index, cloudName))
    .filter((entry): entry is BrandAssetRef => Boolean(entry));

  return logos.length > 0 ? logos : mockBrandContext.logos;
}

function normalizeLogo(value: unknown, index: number, cloudName: string): BrandAssetRef | null {
  if (!isRecord(value)) {
    return null;
  }

  const publicId = safeString(asString(value.publicId));
  const imageUrl = safeString(asString(value.imageUrl), publicId ? buildCloudinaryImageUrl(cloudName, publicId) : "");
  if (!imageUrl) {
    return null;
  }

  const themeValue = safeString(asString(value.theme));
  const theme = themeValue === "light" || themeValue === "dark" || themeValue === "neutral" ? themeValue : undefined;
  const assetTypeValue = safeString(asString(value.assetType), "logo");
  const assetType = assetTypeValue === "logo" || assetTypeValue === "texture" || assetTypeValue === "reference-image" || assetTypeValue === "other"
    ? assetTypeValue
    : "other";

  return {
    id: safeString(asString(value.id), `brand-asset-${index + 1}`),
    title: safeString(asString(value.title), `Brand asset ${index + 1}`),
    assetType,
    publicId: publicId || undefined,
    imageUrl,
    theme,
    usageNotes: safeString(asString(value.usageNotes)) || undefined,
  };
}

function normalizeColors(value: unknown): BrandColorToken[] {
  if (!Array.isArray(value)) {
    return mockBrandContext.colors;
  }

  const colors = value
    .map((entry) => normalizeColor(entry))
    .filter((entry): entry is BrandColorToken => Boolean(entry));

  return colors.length > 0 ? colors : mockBrandContext.colors;
}

function normalizeColor(value: unknown): BrandColorToken | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = safeString(asString(value.name));
  const hex = safeString(asString(value.value));
  if (!name || !hex) {
    return null;
  }

  const role = safeString(asString(value.role));

  return {
    name,
    value: hex,
    role: isColorRole(role) ? role : undefined,
    usageNotes: safeString(asString(value.usageNotes)) || undefined,
  };
}

function normalizeTypography(value: unknown): BrandTypographyToken[] {
  if (!Array.isArray(value)) {
    return mockBrandContext.typography;
  }

  const typography = value
    .map((entry) => normalizeTypographyToken(entry))
    .filter((entry): entry is BrandTypographyToken => Boolean(entry));

  return typography.length > 0 ? typography : mockBrandContext.typography;
}

function normalizeTypographyToken(value: unknown): BrandTypographyToken | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = safeString(asString(value.name));
  const family = safeString(asString(value.family));
  const role = safeString(asString(value.role));

  if (!name || !family || !isTypographyRole(role)) {
    return null;
  }

  return {
    name,
    family,
    role,
    weight: safeString(asString(value.weight)) || undefined,
    transform: safeString(asString(value.transform)) || undefined,
    usageNotes: safeString(asString(value.usageNotes)) || undefined,
  };
}

function normalizeVoice(value: unknown): BrandVoiceGuideline {
  if (!isRecord(value)) {
    return mockBrandContext.voice;
  }

  return {
    toneAttributes: toStringArray(value.toneAttributes, mockBrandContext.voice.toneAttributes),
    do: toStringArray(value.do, mockBrandContext.voice.do),
    dont: toStringArray(value.dont, mockBrandContext.voice.dont),
    examplePhrases: toStringArray(value.examplePhrases, mockBrandContext.voice.examplePhrases ?? []),
  };
}

function normalizeCtaGuidance(value: unknown): BrandCtaGuidance {
  if (!isRecord(value)) {
    return mockBrandContext.ctaGuidance;
  }

  return {
    preferredStyles: toStringArray(value.preferredStyles, mockBrandContext.ctaGuidance.preferredStyles),
    discouragedStyles: toStringArray(value.discouragedStyles, mockBrandContext.ctaGuidance.discouragedStyles),
    examples: toStringArray(value.examples, mockBrandContext.ctaGuidance.examples ?? []),
  };
}

function normalizeImageGuidance(value: unknown): BrandImageGuidance {
  if (!isRecord(value)) {
    return mockBrandContext.imageGuidance;
  }

  return {
    styleKeywords: toStringArray(value.styleKeywords, mockBrandContext.imageGuidance.styleKeywords),
    compositionNotes: toStringArray(value.compositionNotes, mockBrandContext.imageGuidance.compositionNotes),
    discouragedElements: toStringArray(value.discouragedElements, mockBrandContext.imageGuidance.discouragedElements ?? []),
  };
}

function normalizeTemplateTokens(value: unknown): BrandTemplateTokens {
  if (!isRecord(value)) {
    return mockBrandContext.templateTokens;
  }

  return {
    email: normalizeStringRecord(value.email, mockBrandContext.templateTokens.email),
    landingPage: normalizeStringRecord(value.landingPage, mockBrandContext.templateTokens.landingPage),
    ad: normalizeStringRecord(value.ad, mockBrandContext.templateTokens.ad),
  };
}

function normalizeStringRecord(value: unknown, fallback?: Record<string, string>) {
  if (!isRecord(value)) {
    return fallback;
  }

  const entries = Object.entries(value)
    .map(([key, entryValue]) => [key, asString(entryValue)])
    .filter((entry): entry is [string, string] => Boolean(entry[1]));

  return entries.length > 0 ? Object.fromEntries(entries) : fallback;
}

function buildCloudinaryImageUrl(cloudName: string, publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`;
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

function toStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((entry) => asString(entry)?.trim())
    .filter((entry): entry is string => Boolean(entry));

  return normalized.length > 0 ? normalized : fallback;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function safeString(value: string | null | undefined, fallback = "") {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTypographyRole(value: string): value is BrandTypographyToken["role"] {
  return ["heading", "subheading", "body", "caption", "cta"].includes(value);
}

function isColorRole(value: string): value is NonNullable<BrandColorToken["role"]> {
  return ["primary", "secondary", "accent", "background", "text", "border", "support"].includes(value);
}
