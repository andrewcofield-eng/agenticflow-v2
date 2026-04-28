import type { HtmlArtifact } from "@/lib/types/renderers";

export type CampaignInput = {
  campaignGoal: string;
  selectedSegmentName: string;
  selectedProductOrCategory: string;
  selectedTheme?: string;
  selectedChannelEmphasis?: string;
};

export type StrategyOutput = {
  campaignName: string;
  campaignAngle: string;
  valueProposition: string;
  ctaRecommendation: string;
  suggestedChannelMix: string[];
  strategyRationale: string[];
};

export type GeneratedContent = {
  emailSubject: string;
  emailBody: string;
  socialPost: string;
  adHeadline: string;
  adCopy: string;
  emailHtml?: HtmlArtifact;
  landingPageHtml?: HtmlArtifact;
  source?: "ai-generated" | "placeholder";
  model?: string;
  temperature?: number;
  tokenEstimate?: number;
  errorMessage?: string;
};

export type ReviewSummary = {
  completenessSummary: string;
  consistencySummary: string;
  assumptionsList: string[];
  humanReviewChecklist: string[];
  finalReviewStatus: "ready-for-review" | "needs-attention";
};
