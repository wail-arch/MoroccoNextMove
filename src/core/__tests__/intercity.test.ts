import { describe, expect, it } from "vitest";
import { planIntercity } from "../engine/intercity";
import { snapshot, TODAY } from "./fixtures";

const at = (minutes: number) => ({
  dayOfWeek: 0,
  minutes,
  todayIso: TODAY,
});

describe("intercity Casablanca → Marrakech at 08:00", () => {
  const query = {
    fromStopId: "CASA_VOYAGEURS",
    toStopId: "MARRAKECH",
    when: at(8 * 60),
  };

  it("fastest picks the next direct train with a booking deep link", () => {
    const moves = planIntercity(query, snapshot, "fastest");
    expect(moves[0].headlineMode).toBe("train");
    expect(moves[0].legs[0].departAt).toBe("08:50");
    expect(moves[0].legs[0].arriveAt).toBe("11:50");
    expect(moves[0].reasons).toContain("fastest");
    expect(moves[0].reasons).toContain("direct-route");
    expect(moves[0].deepLink?.url).toContain("oncf");
  });

  it("cheapest picks the coach", () => {
    const moves = planIntercity(query, snapshot, "cheapest");
    expect(moves[0].headlineMode).toBe("coach");
    expect(moves[0].totalFare.min).toBe(60);
    expect(moves[0].reasons).toContain("cheapest");
  });

  it("balanced returns ranked options with honest fare bands", () => {
    const moves = planIntercity(query, snapshot, "balanced");
    expect(moves.length).toBeGreaterThanOrEqual(2);
    for (const move of moves) {
      expect(move.totalFare.max).toBeGreaterThanOrEqual(move.totalFare.min);
      expect(move.tier).toBe("cached-verified");
    }
  });
});

describe("intercity with a transfer (Tanger → Marrakech at 07:30)", () => {
  const query = {
    fromStopId: "TANGER_VILLE",
    toStopId: "MARRAKECH",
    when: at(7 * 60 + 30),
  };

  it("builds a two-leg journey through Casa-Voyageurs", () => {
    const moves = planIntercity(query, snapshot, "fastest");
    expect(moves.length).toBeGreaterThan(0);
    const journey = moves[0];
    expect(journey.transfers).toBe(1);
    expect(journey.legs).toHaveLength(2);
    expect(journey.legs[0].to.stopId).toBe("CASA_VOYAGEURS");
    expect(journey.legs[1].from.stopId).toBe("CASA_VOYAGEURS");
  });

  it("respects the transfer buffer", () => {
    const moves = planIntercity(query, snapshot, "fastest");
    const [first, second] = moves[0].legs;
    // Arrive Casa 10:10; with a 20-minute buffer the 12:50 Atlas is the
    // earliest legal connection.
    expect(first.arriveAt).toBe("10:10");
    expect(second.departAt).toBe("12:50");
  });

  it("sums fares across both legs", () => {
    const moves = planIntercity(query, snapshot, "fastest");
    const journey = moves[0];
    expect(journey.totalFare.min).toBe(150 + 90);
    expect(journey.totalFare.max).toBe(250 + 150);
  });
});
