import OpenAI from "openai";
import type { Audience } from "@/lib/types/audience";
import type { GeneratedContent, StrategyOutput } from "@/lib/types/campaign";
import type { Product } from "@/lib/types/product";

type GenerateCampaignContentInput = {
  objective: string;
  audience?: Audience;
  products: Product[];
  strategy?: StrategyOutput;
  cta?: string;
  channels: string[];
  temperatureBoost?: number;
};

type GeneratedContentResult = {
  content: GeneratedContent;
  source: "ai-generated" | "placeholder";
  warning?: string;
};

export async function generateCampaignContent(input: GenerateCampaignContentInput): Promise<GeneratedContentResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4";
  const temperature = Math.min(1.1, 0.7 + (input.temperatureBoost ?? 0));

  if (!apiKey) {
    return {
      content: buildPlaceholderCampaignContent(input, { temperature }),
      source: "placeholder",
      warning: "OPENAI_API_KEY is not configured.",
    };
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a marketing content specialist. Create polished campaign copy that is concise, persuasive, and channel-appropriate. Return valid JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(input),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("OpenAI returned an empty response.");

    const parsed = JSON.parse(raw) as {
      emailSubject: string;
      emailBody: string;
      socialPost: string;
      adHeadline: string;
      adCopy: string;
    };

    const tokenEstimate = completion.usage?.total_tokens;

    return {
      content: {
        emailSubject: parsed.emailSubject,
        emailBody: parsed.emailBody,
        socialPost: parsed.socialPost,
        adHeadline: parsed.adHeadline,
        adCopy: parsed.adCopy,
        source: "ai-generated",
        model,
        temperature,
        tokenEstimate,
      },
      source: "ai-generated",
    };
  } catch (error) {
    return {
      content: buildPlaceholderCampaignContent(input, { temperature, model }),
      source: "placeholder",
      warning: error instanceof Error ? error.message : "Unknown OpenAI error.",
    };
  }
}

export function buildPlaceholderCampaignContent(
  input: GenerateCampaignContentInput,
  options: { temperature: number; model?: string },
): GeneratedContent {
  const audienceName = input.audience?.name ?? "your priority audience";
  const audienceDescription = input.audience?.description ?? "an audience selected by the orchestrator";
  const productNames = input.products.map((product) => product.name).join(", ") || "the selected products";
  const strategyAngle = input.strategy?.campaignAngle ?? "clear audience-fit messaging";
  const cta = input.cta ?? input.strategy?.ctaRecommendation ?? "See how it works";

  return {
    emailSubject: `${audienceName}: a smarter way to move this campaign forward`,
    emailBody: `This placeholder draft is built for ${audienceName}. It highlights ${productNames} for ${audienceDescription}, leans on the strategy angle ${strategyAngle}, and closes with the CTA \"${cta}.\"`,
    socialPost: `A connected campaign starts with connected context. This draft targets ${audienceName} and spotlights ${productNames} with a message designed to feel more relevant and easier to act on.`,
    adHeadline: `Built for ${audienceName}`,
    adCopy: `Highlight ${productNames} with a sharper strategy, clear proof points, and a CTA that invites action: ${cta}.`,
    source: "placeholder",
    model: options.model,
    temperature: options.temperature,
  };
}

function buildPrompt(input: GenerateCampaignContentInput) {
  const audienceSummary = input.audience
    ? `${input.audience.name} | ${input.audience.description} | Lifecycle: ${input.audience.lifecycleStage} | Intent: ${input.audience.intentSignals.join(", ")}`
    : "Priority audience selected by the orchestrator.";

  const productSummary = input.products.length > 0
    ? input.products.map((product) => `- ${product.name}: benefits ${product.benefits.join(", ")}; features ${product.features.join(", ")}`).join("\n")
    : "- Selected product set from the orchestrator";

  return `Create campaign copy in JSON with these exact keys: emailSubject, emailBody, socialPost, adHeadline, adCopy.

Campaign objective: ${input.objective}
Target audience: ${audienceSummary}
Selected products and benefits:
${productSummary}
Messaging angle: ${input.strategy?.campaignAngle ?? "Not provided"}
Value proposition: ${input.strategy?.valueProposition ?? "Not provided"}
CTA: ${input.cta ?? input.strategy?.ctaRecommendation ?? "Not provided"}
Channels: ${input.channels.join(", ")}

Requirements:
- Email subject: under 12 words.
- Email body: 90-140 words.
- Social post: under 60 words.
- Ad headline: under 10 words.
- Ad copy: under 30 words.
- Keep the tone crisp, modern, and B2B-friendly.
- Mention benefits, not just product names.
- Do not include markdown fences or commentary, only JSON.`;
}
