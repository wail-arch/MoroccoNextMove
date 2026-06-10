import { NextResponse } from "next/server";
import { getCitySnapshot } from "@/data";
import { isPackCity, PACK_VERSION } from "@/data/pack-version";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ city: string }> },
) {
  const { city } = await params;
  if (!isPackCity(city)) {
    return NextResponse.json({ error: "unknown pack" }, { status: 404 });
  }

  return NextResponse.json(
    {
      version: PACK_VERSION,
      city,
      generatedAt: new Date().toISOString(),
      snapshot: getCitySnapshot(city),
    },
    {
      headers: {
        // Packs are immutable per version; clients re-check via version field.
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
