import { describe, expect, it } from "vitest";
import { rankNextMoves } from "../engine/rank";
import { makeContext, snapshot } from "./fixtures";

/*
 * Dossier scenario: landing at Marrakech Menara at 23:40. The airport bus
 * stopped running hours ago, the riad is 4+ km away inside the medina, and
 * this is precisely the moment the product must give one calm, honest answer.
 */

describe("airport arrival at night (RAK → medina riad, 23:40)", () => {
  const ctx = makeContext({
    originPlaceId: "rak-airport",
    destinationPlaceId: "riad-area-north",
    minutes: 23 * 60 + 40,
  });

  it("recommends a petit taxi first", () => {
    const moves = rankNextMoves(ctx, snapshot);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0].headlineMode).toBe("petit-taxi");
    expect(moves[0].reasons).toContain("night-safer");
  });

  it("rolls the airport bus over to tomorrow's first departure, ranked below the taxi", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const busIdx = moves.findIndex((m) => m.headlineMode === "bus");
    const taxiIdx = moves.findIndex((m) => m.headlineMode === "petit-taxi");
    expect(busIdx).toBeGreaterThanOrEqual(0);
    expect(busIdx).toBeGreaterThan(taxiIdx);

    const busLeg = moves[busIdx].legs.find((l) => l.mode === "bus");
    expect(busLeg?.departAt).toBe("06:30");
    expect(busLeg?.dayOffset).toBe(1);
  });

  it("drops the taxi at the medina gate with a verified final walk", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const taxi = moves[0];
    expect(taxi.legs).toHaveLength(2);
    expect(taxi.legs[0].mode).toBe("petit-taxi");
    expect(taxi.legs[0].to.name.en).toBe("Bab Doukkala");
    expect(taxi.legs[1].mode).toBe("walk");
    // Final approach uses the riad area's verified pin note.
    expect(taxi.legs[1].walkingNote?.en).toMatch(/mosque/);
  });

  it("does not offer a 4 km night walk at all", () => {
    const moves = rankNextMoves(ctx, snapshot);
    expect(moves.some((m) => m.headlineMode === "walk")).toBe(false);
  });

  it("applies the official night multiplier to the fare band", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const taxi = moves[0];
    // Day band for 4–8 km is 25–50 MAD; night multiplier is 1.5.
    expect(taxi.totalFare.min).toBe(38);
    expect(taxi.totalFare.max).toBe(75);
    expect(taxi.paymentModes).toContain("cash-small-bills");
  });

  it("attaches the meter advisory to the taxi move", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const ids = moves[0].advisories.map((a) => a.id);
    expect(ids).toContain("adv-taxi-meter-marrakech");
  });
});

describe("airport arrival in daytime (14:00)", () => {
  const ctx = makeContext({
    originPlaceId: "rak-airport",
    destinationPlaceId: "riad-area-north",
    minutes: 14 * 60,
  });

  it("offers the airport bus, honestly flagged as estimated", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const bus = moves.find((m) => m.headlineMode === "bus");
    expect(bus).toBeDefined();
    expect(bus?.tier).toBe("estimated-flagged");
  });

  it("charges the day fare band on the taxi", () => {
    const moves = rankNextMoves(ctx, snapshot);
    const taxi = moves.find((m) => m.headlineMode === "petit-taxi");
    expect(taxi?.totalFare.min).toBe(25);
    expect(taxi?.totalFare.max).toBe(50);
  });
});
