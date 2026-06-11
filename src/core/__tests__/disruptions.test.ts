import { describe, expect, it } from "vitest";
import { rankNextMoves } from "../engine/rank";
import type { AdvisoryNote, DataSnapshot } from "../types";
import { makeContext, snapshot } from "./fixtures";

/*
 * Dated service notices (kind: "disruption") must surface only inside
 * their activeBetween window — an expired Ramadan timetable note showing
 * in June would be exactly the kind of stale noise this product exists
 * to eliminate.
 */

const name = (en: string) => ({ en, fr: en, ar: en });

function disruption(
  id: string,
  fromIso: string,
  toIso: string,
): AdvisoryNote {
  return {
    id,
    kind: "disruption",
    severity: "caution",
    activeBetween: { fromIso, toIso },
    appliesTo: { modes: ["tram"] },
    title: name("Service notice"),
    body: name("Timetable change."),
    tier: "cached-verified",
    provenance: {
      sourceId: "fixture",
      sourceName: "Test fixture",
      method: "editorial-research",
      lastVerifiedAt: "2026-06-01",
    },
  };
}

// Fixture TODAY is 2026-06-11.
const withDisruptions: DataSnapshot = {
  ...snapshot,
  advisories: [
    ...snapshot.advisories,
    disruption("disruption-active", "2026-06-01", "2026-06-30"),
    disruption("disruption-expired", "2026-02-17", "2026-03-19"),
    disruption("disruption-future", "2026-12-01", "2026-12-31"),
  ],
};

describe("dated disruption notices", () => {
  const ctx = makeContext({
    originPlaceId: "casa-voyageurs",
    destinationPlaceId: "casa-port",
    minutes: 9 * 60,
  });

  it("attaches a notice whose window covers today", () => {
    const moves = rankNextMoves(ctx, withDisruptions);
    const tram = moves.find((m) => m.headlineMode === "tram");
    expect(tram?.advisories.map((a) => a.id)).toContain("disruption-active");
  });

  it("filters out expired and future notices", () => {
    const moves = rankNextMoves(ctx, withDisruptions);
    const tram = moves.find((m) => m.headlineMode === "tram");
    const ids = tram?.advisories.map((a) => a.id) ?? [];
    expect(ids).not.toContain("disruption-expired");
    expect(ids).not.toContain("disruption-future");
  });
});
