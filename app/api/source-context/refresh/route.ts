import { NextResponse } from "next/server";
import { getSourceContext, refreshSourceContext } from "@/lib/adapters/data-source-router";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const previous = await getSourceContext();
    const refreshed = await refreshSourceContext();

    const dataUpdated =
      previous.recordCounts.products !== refreshed.recordCounts.products ||
      previous.recordCounts.assets !== refreshed.recordCounts.assets ||
      previous.recordCounts.audiences !== refreshed.recordCounts.audiences ||
      previous.recordCounts.brand !== refreshed.recordCounts.brand;

    return NextResponse.json({
      ...refreshed,
      dataUpdated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to refresh source context.",
      },
      { status: 500 },
    );
  }
}
