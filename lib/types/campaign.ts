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
  source?: "ai-generated" | "placeholder";
  model?: string;
  temperature?: number;
  tokenEstimate?: number;
};

export type ReviewSummary = {
  completenessSummary: string;
  consistencySummary: string;
  assumptionsList: string[];
  humanReviewChecklist: string[];
  finalReviewStatus: "ready-for-review" | "needs-attention";
};
