import { NextResponse } from "next/server";
import { getSourceContext } from "@/lib/adapters/data-source-router";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getSourceContext();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load source context.",
      },
      { status: 500 },
    );
  }
}
