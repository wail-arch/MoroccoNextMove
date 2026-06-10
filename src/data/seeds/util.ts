import type { LocalizedString, Provenance } from "@/core/types";

export function L(en: string, fr: string, ar: string): LocalizedString {
  return { en, fr, ar };
}

export function editorial(lastVerifiedAt: string): Provenance {
  return {
    sourceId: "next-move-editorial",
    sourceName: "Next Move research (forums, operator sites, traveler reports)",
    method: "editorial-research",
    lastVerifiedAt,
  };
}

export function transcribed(
  lastVerifiedAt: string,
  sourceName: string,
  sourceUrl?: string,
): Provenance {
  return {
    sourceId: "operator-timetable",
    sourceName,
    sourceUrl,
    method: "manual-transcription",
    lastVerifiedAt,
  };
}

export function osm(lastVerifiedAt: string): Provenance {
  return {
    sourceId: "openstreetmap",
    sourceName: "OpenStreetMap contributors",
    sourceUrl: "https://www.openstreetmap.org",
    license: "ODbL-1.0",
    method: "osm-extract",
    lastVerifiedAt,
  };
}
