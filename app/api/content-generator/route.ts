import { NextResponse } from "next/server";
import { generateCampaignContent } from "@/lib/services/content-generator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateCampaignContent(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content." },
      { status: 500 },
    );
  }
}
