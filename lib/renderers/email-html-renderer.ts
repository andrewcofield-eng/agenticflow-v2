import type { Asset } from "@/lib/types/asset";
import type { Audience } from "@/lib/types/audience";
import type { BrandContext } from "@/lib/types/brand";
import type { GeneratedContent, StrategyOutput } from "@/lib/types/campaign";
import type { Product } from "@/lib/types/product";
import type { HtmlArtifact } from "@/lib/types/renderers";

type EmailRenderInput = {
  brand: BrandContext;
  audience?: Audience;
  products: Product[];
  heroAsset?: Asset;
  strategy?: StrategyOutput;
  content: GeneratedContent;
};

export function renderEmailHtml(input: EmailRenderInput): HtmlArtifact {
  const brandName = escapeHtml(input.brand.brandName);
  const headingFont = fontStack(getTypographyFamily(input.brand, "heading"), "Arial, sans-serif");
  const bodyFont = fontStack(getTypographyFamily(input.brand, "body"), "Arial, sans-serif");
  const ctaFont = fontStack(getTypographyFamily(input.brand, "cta"), bodyFont);
  const pageBackground = escapeHtml(getColor(input.brand, "background", "#ffffff"));
  const textColor = escapeHtml(getColor(input.brand, "text", "#111111"));
  const accentColor = escapeHtml(getColor(input.brand, "accent", getColor(input.brand, "primary", "#222222")));
  const borderColor = escapeHtml(getColor(input.brand, "border", "#dddddd"));
  const mutedColor = escapeHtml(getColor(input.brand, "secondary", getColor(input.brand, "text", "#111111")));
  const logo = selectLogo(input.brand, "light") ?? input.brand.logos[0];
  const logoUrl = logo ? escapeHtml(safeImageUrl(ensureOptimizedCloudinaryUrl(logo.imageUrl))) : "";
  const logoAlt = escapeHtml(logo?.title ?? `${brandName} logo`);
  const audienceName = escapeHtml(input.audience?.name ?? "Priority audience");
  const subject = escapeHtml(input.content.emailSubject || input.strategy?.campaignName || `${input.brand.brandName} campaign update`);
  const body = formatParagraphs(input.content.emailBody);
  const cta = escapeHtml(input.strategy?.ctaRecommendation ?? input.brand.ctaGuidance.examples?.[0] ?? "Learn more");
  const heroUrl = input.heroAsset ? escapeHtml(safeImageUrl(resolveAssetImageUrl(input.heroAsset))) : "";
  const heroAlt = escapeHtml(input.heroAsset?.title ?? `${input.brand.brandName} hero image`);
  const productCards = input.products.slice(0, 3).map((product) => {
    const name = escapeHtml(product.name);
    const category = escapeHtml(product.category);
    const description = escapeHtml((product.benefits[0] || product.features[0] || product.subcategory || product.targetUseCase || "Selected product") as string);
    return `
      <tr>
        <td style="padding: 0 0 12px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid ${borderColor}; border-radius: 12px;">
            <tr>
              <td style="padding: 16px; font-family: ${bodyFont}; color: ${textColor};">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${mutedColor}; margin-bottom: 6px;">${category}</div>
                <div style="font-size: 18px; line-height: 1.3; font-weight: 700; font-family: ${headingFont}; margin-bottom: 8px;">${name}</div>
                <div style="font-size: 14px; line-height: 1.5;">${description}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body style="margin: 0; padding: 0; background: ${pageBackground};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: ${pageBackground}; margin: 0; padding: 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; background: ${pageBackground}; border: 1px solid ${borderColor}; border-radius: 18px; overflow: hidden;">
            <tr>
              <td style="padding: 24px 24px 12px; font-family: ${bodyFont}; color: ${textColor};">
                ${logoUrl ? `<img src="${logoUrl}" alt="${logoAlt}" style="display: block; max-width: 180px; height: auto; margin-bottom: 20px;" />` : `<div style="font-size: 20px; font-weight: 700; font-family: ${headingFont}; margin-bottom: 20px;">${brandName}</div>`}
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${mutedColor}; margin-bottom: 8px;">Selected audience: ${audienceName}</div>
                <h1 style="margin: 0 0 12px; font-size: 30px; line-height: 1.2; font-family: ${headingFont}; color: ${textColor};">${subject}</h1>
              </td>
            </tr>
            ${heroUrl ? `<tr><td style="padding: 0 24px 20px;"><img src="${heroUrl}" alt="${heroAlt}" style="display: block; width: 100%; height: auto; border-radius: 14px;" /></td></tr>` : ""}
            <tr>
              <td style="padding: 0 24px 24px; font-family: ${bodyFont}; color: ${textColor}; font-size: 16px; line-height: 1.7;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding: 0 24px 24px;">
                <a href="#" style="display: inline-block; background: ${accentColor}; color: ${escapeHtml(getContrastTextColor(accentColor))}; text-decoration: none; padding: 14px 22px; border-radius: 999px; font-family: ${ctaFont}; font-weight: 700;">${cta}</a>
              </td>
            </tr>
            ${productCards ? `<tr><td style="padding: 0 24px 8px; font-family: ${headingFont}; color: ${textColor}; font-size: 20px; font-weight: 700;">Featured products</td></tr>
            <tr><td style="padding: 8px 24px 24px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${productCards}</table></td></tr>` : ""}
            <tr>
              <td style="padding: 16px 24px 24px; border-top: 1px solid ${borderColor}; font-family: ${bodyFont}; color: ${mutedColor}; font-size: 12px; line-height: 1.6;">
                ${escapeHtml((input.brand.complianceNotes ?? []).join(" ") || `${input.brand.brandName} campaign draft for human review.`)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    title: "Email HTML",
    summary: `Self-contained branded email HTML assembled from BrandContext, selected DAM imagery, selected products, and generated email copy (${input.content.source ?? "content"}).`,
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

function formatParagraphs(value: string) {
  return escapeHtml(value)
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p style="margin: 0 0 16px;">${paragraph.replaceAll("\n", "<br />")}</p>`)
    .join("");
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
