import { describe, expect, it } from "vitest";
import { rankNextMoves } from "@/core/engine/rank";
import { planIntercity } from "@/core/engine/intercity";
import { getBaseSnapshot, getCitySnapshot } from "./index";

/*
 * Seed integrity: every record must parse (getBaseSnapshot zod-validates),
 * reference only existing entities, and the real engine must produce sane
 * answers from the real data — the dossier scenarios again, now unmocked.
 */

const WEDNESDAY = 2;

describe("seed integrity", () => {
  const snapshot = getBaseSnapshot();

  it("validates against the domain schemas", () => {
    expect(snapshot.places.length).toBeGreaterThan(20);
    expect(snapshot.lines.length).toBeGreaterThan(8);
    expect(snapshot.advisories.length).toBeGreaterThan(8);
  });

  it("has unique ids per collection", () => {
    for (const key of ["places", "pins", "stops", "lines", "taxiRules", "advisories"] as const) {
      const ids = snapshot[key].map((r: { id: string }) => r.id);
      expect(new Set(ids).size, `${key} ids`).toBe(ids.length);
    }
  });

  it("references only existing stops from lines", () => {
    const stopIds = new Set(snapshot.stops.map((s) => s.id));
    for (const line of snapshot.lines) {
      for (const id of line.stopIds) {
        expect(stopIds.has(id), `line ${line.id} -> stop ${id}`).toBe(true);
      }
      if (line.service.kind === "timetable") {
        for (const trip of line.service.trips) {
          for (const st of trip.stopTimes) {
            expect(stopIds.has(st.stopId), `trip ${trip.tripId} -> ${st.stopId}`).toBe(true);
          }
        }
      }
    }
  });

  it("references only existing places from pins and stops", () => {
    const placeIds = new Set(snapshot.places.map((p) => p.id));
    for (const pin of snapshot.pins) {
      if (pin.placeId) {
        expect(placeIds.has(pin.placeId), `pin ${pin.id}`).toBe(true);
      }
    }
  });

  it("keeps fare bands honest (min ≤ max, positive)", () => {
    for (const line of snapshot.lines) {
      expect(line.fare.min).toBeLessThanOrEqual(line.fare.max);
      expect(line.fare.max).toBeGreaterThan(0);
    }
    for (const rule of snapshot.taxiRules) {
      for (const band of rule.bands) {
        expect(band.fare.min).toBeLessThanOrEqual(band.fare.max);
      }
    }
  });

  it("stamps provenance with a verification date on every record", () => {
    const dated = [
      ...snapshot.places,
      ...snapshot.pins,
      ...snapshot.lines,
      ...snapshot.taxiRules,
      ...snapshot.advisories,
    ];
    for (const record of dated) {
      expect(record.provenance.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("engine on real seeds", () => {
  const snapshot = getBaseSnapshot();

  function ctxFor(
    originId: string,
    destinationId: string,
    minutes: number,
  ) {
    const origin = snapshot.places.find((p) => p.id === originId);
    const destination = snapshot.places.find((p) => p.id === destinationId);
    if (!origin || !destination) throw new Error("place missing");
    return {
      origin: { point: origin.point, placeId: origin.id },
      destination: { point: destination.point, placeId: destination.id },
      when: { dayOfWeek: WEDNESDAY, minutes, todayIso: "2026-06-11" },
      connectivity: "online" as const,
      prefs: { budget: "mid" as const },
    };
  }

  it("answers the night arrival at RAK with a taxi and the price warning", () => {
    const moves = rankNextMoves(
      ctxFor("rak-airport", "medina-north-riads", 23 * 60 + 40),
      snapshot,
    );
    expect(moves[0].headlineMode).toBe("petit-taxi");
    expect(moves[0].advisories.map((a) => a.id)).toContain(
      "adv-mkx-airport-taxi-price",
    );
    expect(moves.some((m) => m.headlineMode === "bus")).toBe(false);
  });

  it("offers the honestly-flagged airport bus by day", () => {
    const moves = rankNextMoves(
      ctxFor("rak-airport", "jemaa-el-fnaa", 11 * 60),
      snapshot,
    );
    const bus = moves.find((m) => m.headlineMode === "bus");
    expect(bus?.tier).toBe("estimated-flagged");
    expect(bus?.advisories.map((a) => a.id)).toContain("adv-mkx-bus19-uncertain");
  });

  it("recommends the CMN airport train into Casablanca", () => {
    const moves = rankNextMoves(
      ctxFor("cmn-airport", "casa-voyageurs-station", 10 * 60),
      snapshot,
    );
    const train = moves.find((m) => m.headlineMode === "train");
    expect(train).toBeDefined();
    expect(train?.legs.some((l) => l.lineId === "oncf-al-bidaoui-cmn")).toBe(true);
  });

  it("plans Casa → Marrakech intercity from real ONCF GTFS times", () => {
    const moves = planIntercity(
      {
        fromStopId: "CASA_VOYAGEURS",
        toStopId: "MARRAKECH",
        when: { dayOfWeek: WEDNESDAY, minutes: 9 * 60, todayIso: "2026-06-11" },
      },
      snapshot,
      "fastest",
    );
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0].headlineMode).toBe("train");
    expect(moves[0].legs[0].departAt).toMatch(/^\d{2}:\d{2}$/);
    expect(moves[0].deepLink?.url).toContain("oncf");
  });

  it("plans Tanger → Marrakech with a transfer", () => {
    const moves = planIntercity(
      {
        fromStopId: "TANGER_VILLE",
        toStopId: "MARRAKECH",
        when: { dayOfWeek: WEDNESDAY, minutes: 8 * 60, todayIso: "2026-06-11" },
      },
      snapshot,
      "fastest",
    );
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0].transfers).toBeGreaterThanOrEqual(1);
  });

  it("walks the Rabat medina last-mile with the gate note", () => {
    const moves = rankNextMoves(
      ctxFor("rabat-ville-station", "rabat-medina", 15 * 60),
      snapshot,
    );
    const walk = moves.find((m) => m.headlineMode === "walk");
    expect(walk).toBeDefined();
    expect(walk?.legs.some((l) => l.walkingNote)).toBe(true);
  });
});

describe("city pack subsets", () => {
  it("Marrakech pack contains its own data plus touching intercity lines", () => {
    const pack = getCitySnapshot("marrakech");
    expect(pack.places.every((p) => p.city === "marrakech")).toBe(true);
    expect(pack.taxiRules.every((t) => t.city === "marrakech")).toBe(true);
    // The Casa–Marrakech rail and coach lines touch the city.
    expect(pack.lines.some((l) => l.id === "AL_ATLAS_CASA_MKC")).toBe(true);
    expect(pack.lines.some((l) => l.id === "ctm-casa-marrakech")).toBe(true);
    // No Rabat-only advisories leak in.
    expect(pack.advisories.some((a) => a.id === "adv-rabat-tram-easy")).toBe(false);
  });
});
