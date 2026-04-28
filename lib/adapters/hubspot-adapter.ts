import { clearCachedValue, getCachedValue, setCachedValue } from "@/lib/adapters/adapter-cache";
import type { AudienceSegment, SourceLoadResult } from "@/lib/adapters/adapter-types";

const HUBSPOT_SEGMENTS_CACHE_KEY = "hubspot:segments";
const HUBSPOT_SEGMENTS_TTL_MS = 60_000;
const DEFAULT_HUBSPOT_PROXY_URL = "https://pim-dam-crm-integration-production.up.railway.app";

const hubSpotFallbackAudiences: AudienceSegment[] = [
  {
    id: "axiom-fitness-co",
    name: "Axiom Fitness Co.",
    lifecycleStage: "Prospecting",
    description: "A fitness brand account aligned to retail campaign activation and merchandising support.",
    size: "B2B account",
    engagementLevel: "Hot",
    intentSignals: ["ABM outreach", "Merchandising interest"],
    estimatedValue: "$0",
    region: "Unknown",
    productInterestTags: ["fitness", "retail", "campaign activation"],
  },
  {
    id: "nexus-creative",
    name: "Nexus Creative",
    lifecycleStage: "Prospecting",
    description: "A creative services account aligned to branded apparel and campaign rollout support.",
    size: "B2B account",
    engagementLevel: "Hot",
    intentSignals: ["Creative services fit", "Brand merch interest"],
    estimatedValue: "$0",
    region: "Unknown",
    productInterestTags: ["creative", "branding", "campaign rollout"],
  },
  {
    id: "valor-athletics",
    name: "Valor Athletics",
    lifecycleStage: "Prospecting",
    description: "An athletics account aligned to seasonal apparel drops and team merchandise programs.",
    size: "B2B account",
    engagementLevel: "Warm",
    intentSignals: ["Seasonal apparel interest", "Athletics fit"],
    estimatedValue: "$0",
    region: "Unknown",
    productInterestTags: ["athletics", "seasonal", "team merch"],
  },
  {
    id: "techstack-hq",
    name: "TechStack HQ",
    lifecycleStage: "Prospecting",
    description: "A technology account aligned to onboarding kits and branded employee merchandise.",
    size: "B2B account",
    engagementLevel: "Warm",
    intentSignals: ["Onboarding interest", "Employee merch fit"],
    estimatedValue: "$0",
    region: "Unknown",
    productInterestTags: ["technology", "onboarding", "employee merch"],
  },
  {
    id: "summit-hospitality",
    name: "Summit Hospitality",
    lifecycleStage: "Prospecting",
    description: "A hospitality account aligned to uniforms, gifting, and guest-facing branded products.",
    size: "B2B account",
    engagementLevel: "Identified",
    intentSignals: ["Hospitality fit", "Gifting interest"],
    estimatedValue: "$0",
    region: "Unknown",
    productInterestTags: ["hospitality", "gifting", "uniforms"],
  },
  {
    id: "bluepeak-media",
    name: "BluePeak Media",
    lifecycleStage: "Prospecting",
    description: "A media account aligned to promotional merch, campaign drops, and branded apparel moments.",
    size: "B2B account",
    engagementLevel: "Cold",
    intentSignals: ["Promo merch interest", "Campaign drop fit"],
    estimatedValue: "$0",
    region: "Unknown",
    productInterestTags: ["media", "promotion", "branded apparel"],
  },
];

type HubSpotWarmProspect = {
  company_name?: string | null;
  industry?: string | null;
  engagement_score?: number | string | null;
  account_value?: string | null;
  buying_stage?: string | null;
  contact?: {
    name?: string | null;
    title?: string | null;
    email?: string | null;
  } | null;
  actions?: Record<string, number> | null;
};

type HubSpotWarmProspectsResponse =
  | HubSpotWarmProspect[]
  | {
    prospects?: HubSpotWarmProspect[];
    data?: HubSpotWarmProspect[];
  };

export async function getHubSpotAudiences(options?: { forceRefresh?: boolean }): Promise<SourceLoadResult<AudienceSegment>> {
  if (!options?.forceRefresh) {
    const cached = getCachedValue<SourceLoadResult<AudienceSegment>>(HUBSPOT_SEGMENTS_CACHE_KEY);
    if (cached) {
      return cached.value;
    }
  }

  try {
    const baseUrl = (process.env.HUBSPOT_PROXY_URL?.trim() || DEFAULT_HUBSPOT_PROXY_URL).replace(/\/$/, "");
    const url = new URL(`${baseUrl}/abm/warm-prospects`);
    url.searchParams.set("directus_url", process.env.DIRECTUS_URL ?? "");
    url.searchParams.set("directus_token", process.env.DIRECTUS_TOKEN ?? "");

    console.log("[hubspot-adapter] Fetching", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HubSpot proxy request failed with status ${response.status}`);
    }

    const json = await response.json() as HubSpotWarmProspectsResponse;
    const prospects = Array.isArray(json)
      ? json
      : Array.isArray(json?.prospects)
        ? json.prospects
        : Array.isArray(json?.data)
          ? json.data
          : null;

    if (!prospects || prospects.length === 0) {
      throw new Error("Unexpected HubSpot response shape");
    }

    const records = prospects.map(normalizeHubSpotAudience);

    const result: SourceLoadResult<AudienceSegment> = {
      records,
      source: "hubspot",
      mode: "live",
      lastRefreshed: new Date().toISOString(),
    };

    setCachedValue(HUBSPOT_SEGMENTS_CACHE_KEY, result, HUBSPOT_SEGMENTS_TTL_MS);
    return result;
  } catch (error) {
    const result: SourceLoadResult<AudienceSegment> = {
      records: hubSpotFallbackAudiences,
      source: "hubspot",
      mode: "mock",
      lastRefreshed: new Date().toISOString(),
      warning: error instanceof Error ? error.message : "HubSpot audience load failed.",
    };

    setCachedValue(HUBSPOT_SEGMENTS_CACHE_KEY, result, HUBSPOT_SEGMENTS_TTL_MS);
    return result;
  }
}

export function clearHubSpotAudiencesCache() {
  clearCachedValue(HUBSPOT_SEGMENTS_CACHE_KEY);
}

function normalizeHubSpotAudience(record: HubSpotWarmProspect): AudienceSegment {
  const abmScore = parseNumber(record.engagement_score);
  const intentSignals = actionsToSignals(record.actions);
  const companyName = safeString(record.company_name, "Unknown account");
  const buyingStage = safeString(record.buying_stage, "Unknown");
  const productInterestTags = Array.from(new Set([
    ...intentSignals,
    safeString(record.industry),
    buyingStage,
  ].filter(Boolean)));

  return {
    id: slugify(record.company_name ?? "unknown-company"),
    name: companyName,
    lifecycleStage: buyingStage,
    description: buildDescription(record),
    size: "B2B account",
    engagementLevel: deriveEngagementLevel(abmScore),
    intentSignals,
    estimatedValue: formatCurrency(record.account_value),
    region: "Unknown",
    productInterestTags,
    industry: safeString(record.industry),
    contactName: safeString(record.contact?.name),
    buyingStage,
    abmScore,
  };
}

function deriveEngagementLevel(abmScore: number) {
  if (abmScore >= 80) {
    return "Hot";
  }

  if (abmScore >= 60) {
    return "Warm";
  }

  if (abmScore >= 40) {
    return "Identified";
  }

  return "Cold";
}

function parseNumber(value: string | number | null | undefined) {
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

function formatCurrency(value: string | number | null | undefined) {
  const numericValue = parseNumber(value);
  if (!numericValue) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function buildDescription(record: HubSpotWarmProspect) {
  const company = safeString(record.company_name, "This account");
  const industry = safeString(record.industry, "unknown industry");
  const buyingStage = safeString(record.buying_stage, "unknown stage");
  return `${company} is a ${industry} account currently in ${buyingStage}.`;
}

function actionsToSignals(actions: Record<string, number> | null | undefined) {
  if (!actions) {
    return ["General interest"];
  }

  const entries = Object.entries(actions).filter(([, count]) => typeof count === "number" && count > 0);
  if (entries.length === 0) {
    return ["General interest"];
  }

  return entries.map(([action, count]) => `${action} (${count})`);
}

function safeString(value: string | null | undefined, fallback = "") {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
