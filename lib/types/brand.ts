export type BrandAssetRef = {
  id: string;
  title: string;
  assetType: "logo" | "texture" | "reference-image" | "other";
  publicId?: string;
  imageUrl: string;
  theme?: "light" | "dark" | "neutral";
  usageNotes?: string;
};

export type BrandColorToken = {
  name: string;
  value: string;
  role?: "primary" | "secondary" | "accent" | "background" | "text" | "border" | "support";
  usageNotes?: string;
};

export type BrandTypographyToken = {
  name: string;
  role: "heading" | "subheading" | "body" | "caption" | "cta";
  family: string;
  weight?: string;
  transform?: string;
  usageNotes?: string;
};

export type BrandVoiceGuideline = {
  do: string[];
  dont: string[];
  toneAttributes: string[];
  examplePhrases?: string[];
};

export type BrandCtaGuidance = {
  preferredStyles: string[];
  discouragedStyles: string[];
  examples?: string[];
};

export type BrandImageGuidance = {
  styleKeywords: string[];
  compositionNotes: string[];
  discouragedElements?: string[];
};

export type BrandTemplateTokens = {
  email?: Record<string, string>;
  landingPage?: Record<string, string>;
  ad?: Record<string, string>;
};

export type BrandContext = {
  brandName: string;
  logos: BrandAssetRef[];
  colors: BrandColorToken[];
  typography: BrandTypographyToken[];
  voice: BrandVoiceGuideline;
  ctaGuidance: BrandCtaGuidance;
  imageGuidance: BrandImageGuidance;
  complianceNotes: string[];
  templateTokens: BrandTemplateTokens;
  sourceAssetId?: string;
  sourcePublicId?: string;
};
