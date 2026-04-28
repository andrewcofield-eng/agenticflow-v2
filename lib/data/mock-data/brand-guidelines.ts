import type { BrandContext } from "@/lib/types/brand";

export const mockBrandContext: BrandContext = {
  brandName: "Urban Threads",
  logos: [
    {
      id: "urbanthreads-primary-logo-dark",
      title: "Primary Logo Dark Background",
      assetType: "logo",
      publicId: "urbanthreads-PrimaryLogo-DKbkgrd_dbzktr",
      imageUrl: "https://res.cloudinary.com/dp0cdq8bj/image/upload/f_auto,q_auto/urbanthreads-PrimaryLogo-DKbkgrd_dbzktr",
      theme: "dark",
      usageNotes: "Use on dark backgrounds.",
    },
    {
      id: "urbanthreads-primary-logo-light",
      title: "Primary Logo Light Background",
      assetType: "logo",
      publicId: "urbanthreads-PrimaryLogo-LTbkgrd_q1hdpt",
      imageUrl: "https://res.cloudinary.com/dp0cdq8bj/image/upload/f_auto,q_auto/urbanthreads-PrimaryLogo-LTbkgrd_q1hdpt",
      theme: "light",
      usageNotes: "Use on light backgrounds.",
    },
  ],
  colors: [
    { name: "Midnight", value: "#111111", role: "text" },
    { name: "Ivory", value: "#F5F1E8", role: "background" },
    { name: "Sand", value: "#C9B79C", role: "accent" },
  ],
  typography: [
    { name: "Headline", role: "heading", family: "Oswald", weight: "600" },
    { name: "Body", role: "body", family: "Inter", weight: "400" },
    { name: "CTA", role: "cta", family: "Inter", weight: "600", transform: "uppercase" },
  ],
  voice: {
    toneAttributes: ["confident", "modern", "clean", "fashion-forward"],
    do: [
      "Keep copy crisp and direct.",
      "Lead with style plus utility.",
      "Sound premium without sounding precious.",
    ],
    dont: [
      "Use overly corporate phrasing.",
      "Overstuff claims.",
      "Sound generic or discount-led.",
    ],
    examplePhrases: ["Built for everyday edge.", "Modern essentials with real wearability."],
  },
  ctaGuidance: {
    preferredStyles: ["short", "action-led", "confident"],
    discouragedStyles: ["pushy", "shouty", "coupon-heavy"],
    examples: ["Shop the drop", "See the collection", "Explore the look"],
  },
  imageGuidance: {
    styleKeywords: ["editorial", "streetwear", "clean composition", "urban lifestyle"],
    compositionNotes: [
      "Prefer strong subject framing.",
      "Use authentic motion and texture.",
      "Balance apparel detail with environment.",
    ],
    discouragedElements: ["cluttered backgrounds", "overly polished studio sterility"],
  },
  complianceNotes: [
    "Do not distort logo proportions.",
    "Maintain sufficient contrast for logo placement.",
  ],
  templateTokens: {
    email: {
      headerLogoTheme: "dark",
      primaryButtonStyle: "solid-accent",
    },
    landingPage: {
      heroTone: "editorial",
    },
    ad: {
      headlineStyle: "short-punchy",
    },
  },
  sourcePublicId: "brand/urban-threads/brand-guidelines",
};
