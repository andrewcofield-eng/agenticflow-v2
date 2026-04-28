import type { Asset } from "@/lib/types/asset";
import type { Audience } from "@/lib/types/audience";
import type { BrandContext } from "@/lib/types/brand";
import type { GeneratedContent, StrategyOutput } from "@/lib/types/campaign";
import type { Product } from "@/lib/types/product";
import type { HtmlArtifact } from "@/lib/types/renderers";

type LandingPageRenderInput = {
  brand: BrandContext;
  audience?: Audience;
  products: Product[];
  heroAsset?: Asset;
  strategy?: StrategyOutput;
  content: GeneratedContent;
};

export function renderLandingPageHtml(input: LandingPageRenderInput): HtmlArtifact {
  const brandName = escapeHtml(input.brand.brandName);
  const headingFont = fontStack(getTypographyFamily(input.brand, "heading"), "Arial, sans-serif");
  const bodyFont = fontStack(getTypographyFamily(input.brand, "body"), "Arial, sans-serif");
  const ctaFont = fontStack(getTypographyFamily(input.brand, "cta"), bodyFont);
  const bgColor = escapeHtml(getColor(input.brand, "background", "#ffffff"));
  const textColor = escapeHtml(getColor(input.brand, "text", "#111111"));
  const accentColor = escapeHtml(getColor(input.brand, "accent", getColor(input.brand, "primary", "#222222")));
  const secondaryColor = escapeHtml(getColor(input.brand, "secondary", "#f3f3f3"));
  const borderColor = escapeHtml(getColor(input.brand, "border", "#dddddd"));
  const logo = selectLogo(input.brand, "light") ?? input.brand.logos[0];
  const logoUrl = logo ? escapeHtml(safeImageUrl(ensureOptimizedCloudinaryUrl(logo.imageUrl))) : "";
  const logoAlt = escapeHtml(logo?.title ?? `${brandName} logo`);
  const audienceName = escapeHtml(input.audience?.name ?? "Priority audience");
  const audienceDescription = escapeHtml(input.audience?.description ?? "Selected audience from the orchestration flow.");
  const heroUrl = input.heroAsset ? escapeHtml(safeImageUrl(resolveAssetImageUrl(input.heroAsset))) : "";
  const heroAlt = escapeHtml(input.heroAsset?.title ?? `${input.brand.brandName} hero image`);
  const headline = escapeHtml(input.strategy?.campaignAngle ?? input.content.emailSubject ?? `${input.brand.brandName} campaign`);
  const body = escapeHtml(input.content.emailBody);
  const cta = escapeHtml(input.strategy?.ctaRecommendation ?? input.brand.ctaGuidance.examples?.[0] ?? "Learn more");
  const social = escapeHtml(input.content.socialPost);
  const productCards = input.products.slice(0, 3).map((product) => {
    const name = escapeHtml(product.name);
    const category = escapeHtml(product.category);
    const benefit = escapeHtml(product.benefits[0] || product.features[0] || product.subcategory || "Selected product");
    return `<div style="border: 1px solid ${borderColor}; border-radius: 16px; padding: 20px; background: ${bgColor};">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${accentColor}; margin-bottom: 8px;">${category}</div>
      <h3 style="margin: 0 0 8px; font-family: ${headingFont}; color: ${textColor}; font-size: 22px;">${name}</h3>
      <p style="margin: 0; font-family: ${bodyFont}; color: ${textColor}; line-height: 1.6;">${benefit}</p>
    </div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(input.strategy?.campaignName ?? input.content.emailSubject)}</title>
  </head>
  <body style="margin: 0; background: ${bgColor}; color: ${textColor};">
    <div style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: ${bodyFont};">
      <header style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-bottom: 24px;">
        <div>
          ${logoUrl ? `<img src="${logoUrl}" alt="${logoAlt}" style="display: block; max-width: 200px; height: auto;" />` : `<div style="font-family: ${headingFont}; font-size: 24px; font-weight: 700;">${brandName}</div>`}
        </div>
        <div style="font-size: 13px; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.08em;">Audience: ${audienceName}</div>
      </header>

      <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px; align-items: center; padding: 24px 0 40px;">
        <div>
          <h1 style="margin: 0 0 16px; font-family: ${headingFont}; font-size: 46px; line-height: 1.1;">${headline}</h1>
          <p style="margin: 0 0 20px; font-size: 18px; line-height: 1.7;">${body}</p>
          <a href="#" style="display: inline-block; background: ${accentColor}; color: ${escapeHtml(getContrastTextColor(accentColor))}; text-decoration: none; padding: 14px 24px; border-radius: 999px; font-family: ${ctaFont}; font-weight: 700;">${cta}</a>
        </div>
        <div>
          ${heroUrl ? `<img src="${heroUrl}" alt="${heroAlt}" style="display: block; width: 100%; height: auto; border-radius: 22px; border: 1px solid ${borderColor};" />` : `<div style="border: 1px dashed ${borderColor}; border-radius: 22px; min-height: 320px; display: grid; place-items: center; color: ${accentColor};">Hero image unavailable</div>`}
        </div>
      </section>

      <section style="padding: 28px; border: 1px solid ${borderColor}; border-radius: 20px; background: ${secondaryColor}; margin-bottom: 28px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${accentColor}; margin-bottom: 10px;">Audience fit</div>
        <h2 style="margin: 0 0 12px; font-family: ${headingFont}; font-size: 30px;">Built for ${audienceName}</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.7;">${audienceDescription}</p>
      </section>

      <section style="margin-bottom: 28px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${accentColor}; margin-bottom: 10px;">Featured products</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px;">
          ${productCards}
        </div>
      </section>

      <section style="padding: 28px; border: 1px solid ${borderColor}; border-radius: 20px; background: ${bgColor}; margin-bottom: 28px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${accentColor}; margin-bottom: 10px;">Campaign social line</div>
        <p style="margin: 0; font-size: 18px; line-height: 1.6;">${social}</p>
      </section>

      <footer style="padding: 18px 0 32px; border-top: 1px solid ${borderColor}; font-size: 13px; line-height: 1.6; color: ${textColor};">
        ${escapeHtml((input.brand.complianceNotes ?? []).join(" ") || `${input.brand.brandName} landing page draft for human review.`)}
      </footer>
    </div>
  </body>
</html>`;

  return {
    title: "Landing Page HTML",
    summary: `Self-contained branded landing page HTML assembled from BrandContext, selected DAM imagery, selected products, and generated campaign copy (${input.content.source ?? "content"}).`,
    html,
    source: "rendered",
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getTypographyFamily(brand: BrandContext, role: "heading" | "body" | "cta") {
  return safeFontFamily(
    brand.typography.find((token) => token.role === role)?.family || brand.typography[0]?.family || "Arial",
    "Arial",
  );
}

function getColor(brand: BrandContext, role: string, fallback: string) {
  return safeCssColor(brand.colors.find((token) => token.role === role)?.value || fallback, fallback);
}

function fontStack(primary: string, fallback: string) {
  return `'${escapeHtml(safeFontFamily(primary, "Arial"))}', ${fallback}`;
}

function selectLogo(brand: BrandContext, theme: "light" | "dark") {
  return brand.logos.find((logo) => logo.theme === theme) || brand.logos[0];
}

function ensureOptimizedCloudinaryUrl(url: string) {
  return /\/image\/upload\//.test(url) && !/\/f_auto,q_auto\//.test(url)
    ? url.replace("/image/upload/", "/image/upload/f_auto,q_auto/")
    : url;
}

function resolveAssetImageUrl(asset: Asset) {
  const imageUrl = asset.imageUrl || "";
  if (imageUrl) {
    return ensureOptimizedCloudinaryUrl(imageUrl);
  }

  if (asset.publicId && asset.cloudName) {
    return `https://res.cloudinary.com/${asset.cloudName}/image/upload/f_auto,q_auto/${asset.publicId}`;
  }

  return "";
}

function getContrastTextColor(background: string) {
  return background.toLowerCase() === "#111111" ? "#ffffff" : "#111111";
}

function safeCssColor(value: string, fallback: string) {
  const normalized = value.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized) ? normalized : fallback;
}

function safeFontFamily(value: string, fallback: string) {
  const normalized = value.trim();
  return /^[A-Za-z0-9\s\-_,"']+$/.test(normalized) ? normalized : fallback;
}

function safeImageUrl(value: string) {
  const normalized = value.trim();
  return /^https:\/\//.test(normalized) ? normalized : "";
}
