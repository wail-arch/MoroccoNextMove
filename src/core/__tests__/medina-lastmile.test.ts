import { describe, expect, it } from "vitest";
import { rankNextMoves } from "../engine/rank";
import { makeContext, snapshot } from "./fixtures";

/*
 * Dossier scenario: standing on Jemaa el-Fnaa, riad ~400 m away inside the
 * medina. The "final 200 meters" are the product's signature moment: verified
 * entrance pin, landmark instructions, scam advisory — and it must all work
 * offline.
 */

describe("medina last-mile (Jemaa el-Fnaa → riad, 15:00)", () => {
  const ctx = makeContext({
    originPlaceId: "jemaa-el-fnaa",
    destinationPlaceId: "riad-area-north",
    minutes: 15 * 60,
  });

  it("recommends the short walk first", () => {
    const moves = rankNextMoves(ctx, snapshot);
    expect(moves[0].headlineMode).toBe("walk");
    expect(moves[0].reasons).toContain("short-walk");
    expect(moves[0].reasons).toContain("works-offline");
  });

  it("uses the verified entrance pin with landmark instructions", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const walk = moves[0];
    expect(walk.reasons).toContain("verified-entrance");
    const walkLeg = walk.legs.find((l) => l.mode === "walk");
    expect(walkLeg?.walkingNote?.en).toMatch(/mosque/);
    // Walk inherits the pin's verification, not a raw GPS guess.
    expect(walk.tier).toBe("cached-verified");
  });

  it("attaches the fake-guide advisory around the square", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const ids = moves[0].advisories.map((a) => a.id);
    expect(ids).toContain("adv-jemaa-fake-guides");
  });

  it("produces the same answer offline", () => {
    const offline = rankNextMoves(
      makeContext({
        originPlaceId: "jemaa-el-fnaa",
        destinationPlaceId: "riad-area-north",
        minutes: 15 * 60,
        connectivity: "offline",
      }),
      snapshot,
    );
    expect(offline[0].headlineMode).toBe("walk");
    expect(offline[0].legs[0].walkingNote).toBeDefined();
  });

  it("flags an unpinned medina walk as estimated", () => {
    const moves = rankNextMoves(
      makeContext({
        originPlaceId: "riad-area-north",
        destinationPlaceId: "jemaa-el-fnaa",
        minutes: 15 * 60,
      }),
      snapshot,
    );
    const walk = moves.find((m) => m.headlineMode === "walk");
    // Jemaa el-Fnaa has no verified pin in the fixture, and it sits in the
    // medina where GPS routing is unreliable — the tier must say so.
    expect(walk?.tier).toBe("estimated-flagged");
  });
});
