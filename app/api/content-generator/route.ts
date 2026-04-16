import OpenAI from "openai";
import { NextResponse } from "next/server";
import { generateCampaignContent } from "@/lib/services/content-generator";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("[content-generator] OPENAI_API_KEY:", apiKey ? "present" : "missing");

  try {
    const body = await request.json();

    if (!apiKey) {
      console.error("[content-generator] Missing OPENAI_API_KEY before OpenAI client initialization.");
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured.", apiKey: "missing" },
        { status: 500 },
      );
    }

    try {
      new OpenAI({ apiKey });
      console.log("[content-generator] OpenAI client initialized successfully.");
    } catch (error) {
      console.error("[content-generator] OpenAI client initialization failed:", error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "OpenAI client initialization failed.",
          apiKey: "present",
        },
        { status: 500 },
      );
    }

    const result = await generateCampaignContent({ ...body, throwOnError: true });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[content-generator] OpenAI request failed:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate content.",
        apiKey: apiKey ? "present" : "missing",
      },
      { status: 500 },
    );
  }
}
