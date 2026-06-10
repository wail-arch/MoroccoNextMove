import { describe, expect, it } from "vitest";
import { rankNextMoves } from "../engine/rank";
import { makeContext, snapshot } from "./fixtures";

/*
 * Dossier scenario: arriving at Casa-Voyageurs, needing Casa-Port (the
 * commuter-rail hub) across town. Casablanca has the strongest official
 * urban layer — the tram should beat a taxi for a lean traveler.
 */

describe("station transfer (Casa-Voyageurs → Casa-Port, 08:00, lean budget)", () => {
  const ctx = makeContext({
    originPlaceId: "casa-voyageurs",
    destinationPlaceId: "casa-port",
    minutes: 8 * 60,
    budget: "lean",
  });

  it("ranks the tram above the taxi", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const tramIdx = moves.findIndex((m) => m.headlineMode === "tram");
    const taxiIdx = moves.findIndex((m) => m.headlineMode === "petit-taxi");
    expect(tramIdx).toBeGreaterThanOrEqual(0);
    expect(taxiIdx).toBeGreaterThanOrEqual(0);
    expect(tramIdx).toBeLessThan(taxiIdx);
  });

  it("reports the flat tram fare and frequent service", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const tram = moves.find((m) => m.headlineMode === "tram");
    expect(tram?.totalFare.min).toBe(8);
    expect(tram?.totalFare.max).toBe(8);
    expect(tram?.reasons).toContain("frequent-service");
  });

  it("includes a scheduled departure time on the tram leg", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const tram = moves.find((m) => m.headlineMode === "tram");
    const tramLeg = tram?.legs.find((l) => l.mode === "tram");
    expect(tramLeg?.departAt).toMatch(/^\d{2}:\d{2}$/);
  });

  it("still offers the taxi as a ranked alternative", () => {
    const moves = rankNextMoves(ctx, snapshot);
    expect(moves.some((m) => m.headlineMode === "petit-taxi")).toBe(true);
  });
});
