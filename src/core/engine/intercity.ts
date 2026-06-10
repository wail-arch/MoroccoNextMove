import { toHHMM } from "../time";
import type {
  DataSnapshot,
  IntercityStrategy,
  Leg,
  Line,
  NextMove,
  PaymentMode,
  Stop,
} from "../types";
import { effectiveTier, oldestDate, weakestTier } from "./confidence";
import { nextRide } from "./candidates";
import { fareMid } from "./score";

/*
 * Intercity planning over the rail + coach network: direct journeys plus
 * single-transfer journeys through a shared station. Three strategies pick
 * different winners from the same candidate set — the data does not change,
 * only what the traveler optimizes for.
 */

const TRANSFER_BUFFER_MINUTES = 20;

export interface IntercityQuery {
  fromStopId: string;
  toStopId: string;
  when: { dayOfWeek: number; minutes: number; todayIso: string };
}

interface JourneyCandidate {
  move: NextMove;
  departAtMinutes: number;
  arriveAtMinutes: number;
}

function intercityLines(snapshot: DataSnapshot): Line[] {
  return snapshot.lines.filter(
    (line) => line.mode === "train" || line.mode === "coach",
  );
}

function rideLeg(
  line: Line,
  ride: {
    fromStop: Stop;
    toStop: Stop;
    departAtMinutes: number;
    arriveAtMinutes: number;
  },
  todayIso: string,
): Leg {
  return {
    mode: line.mode,
    from: {
      name: ride.fromStop.name,
      point: ride.fromStop.point,
      stopId: ride.fromStop.id,
    },
    to: {
      name: ride.toStop.name,
      point: ride.toStop.point,
      stopId: ride.toStop.id,
    },
    durationMinutes: ride.arriveAtMinutes - ride.departAtMinutes,
    lineId: line.id,
    lineName: line.name,
    operator: line.operator,
    departAt: toHHMM(ride.departAtMinutes),
    arriveAt: toHHMM(ride.arriveAtMinutes),
    fare: line.fare,
    paymentModes: line.paymentModes,
    tier: effectiveTier(line.tier, line.provenance.lastVerifiedAt, todayIso),
    lastVerifiedAt: line.provenance.lastVerifiedAt,
  };
}

function journeyFromLegs(
  id: string,
  legs: Leg[],
  departAtMinutes: number,
  arriveAtMinutes: number,
  deepLink?: NextMove["deepLink"],
): JourneyCandidate {
  const paymentModes = [
    ...new Set(legs.flatMap((l) => l.paymentModes ?? [])),
  ] as PaymentMode[];

  return {
    move: {
      id,
      headlineMode: legs[0].mode,
      legs,
      totalDurationMinutes: arriveAtMinutes - departAtMinutes,
      totalFare: {
        currency: "MAD",
        min: legs.reduce((s, l) => s + (l.fare?.min ?? 0), 0),
        max: legs.reduce((s, l) => s + (l.fare?.max ?? 0), 0),
        per: "person",
      },
      paymentModes,
      tier: weakestTier(legs.map((l) => l.tier)),
      lastVerifiedAt: oldestDate(legs.map((l) => l.lastVerifiedAt)),
      transfers: legs.length - 1,
      advisories: [],
      deepLink,
      reasons: [],
      score: 0,
    },
    departAtMinutes,
    arriveAtMinutes,
  };
}

function directJourneys(
  query: IntercityQuery,
  snapshot: DataSnapshot,
): JourneyCandidate[] {
  const out: JourneyCandidate[] = [];
  for (const line of intercityLines(snapshot)) {
    const fromIdx = line.stopIds.indexOf(query.fromStopId);
    const toIdx = line.stopIds.indexOf(query.toStopId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) continue;

    const ride = nextRide(
      line,
      fromIdx,
      toIdx,
      query.when.minutes,
      query.when.dayOfWeek,
      snapshot,
    );
    if (!ride) continue;

    out.push(
      journeyFromLegs(
        `direct-${line.id}`,
        [rideLeg(line, ride, query.when.todayIso)],
        ride.departAtMinutes,
        ride.arriveAtMinutes,
        line.deepLink,
      ),
    );
  }
  return out;
}

function transferJourneys(
  query: IntercityQuery,
  snapshot: DataSnapshot,
): JourneyCandidate[] {
  const out: JourneyCandidate[] = [];
  const lines = intercityLines(snapshot);

  for (const first of lines) {
    const fromIdx = first.stopIds.indexOf(query.fromStopId);
    if (fromIdx === -1) continue;

    for (const second of lines) {
      if (second.id === first.id) continue;
      const toIdx = second.stopIds.indexOf(query.toStopId);
      if (toIdx === -1) continue;

      // Shared stations where a transfer is possible.
      for (const hubId of first.stopIds) {
        if (hubId === query.fromStopId || hubId === query.toStopId) continue;
        const hubIdxFirst = first.stopIds.indexOf(hubId);
        const hubIdxSecond = second.stopIds.indexOf(hubId);
        if (hubIdxSecond === -1) continue;

        const firstRide = nextRide(
          first,
          fromIdx,
          hubIdxFirst,
          query.when.minutes,
          query.when.dayOfWeek,
          snapshot,
        );
        if (!firstRide) continue;

        const secondRide = nextRide(
          second,
          hubIdxSecond,
          toIdx,
          firstRide.arriveAtMinutes + TRANSFER_BUFFER_MINUTES,
          query.when.dayOfWeek,
          snapshot,
        );
        if (!secondRide) continue;

        out.push(
          journeyFromLegs(
            `via-${hubId}-${first.id}-${second.id}`,
            [
              rideLeg(first, firstRide, query.when.todayIso),
              rideLeg(second, secondRide, query.when.todayIso),
            ],
            firstRide.departAtMinutes,
            secondRide.arriveAtMinutes,
            first.deepLink ?? second.deepLink,
          ),
        );
      }
    }
  }
  return out;
}

function dedupeBest(candidates: JourneyCandidate[]): JourneyCandidate[] {
  // Several hubs can produce the same line pair; keep the earliest arrival
  // per line combination.
  const byKey = new Map<string, JourneyCandidate>();
  for (const c of candidates) {
    const key = c.move.legs.map((l) => l.lineId).join(">");
    const existing = byKey.get(key);
    if (!existing || c.arriveAtMinutes < existing.arriveAtMinutes) {
      byKey.set(key, c);
    }
  }
  return [...byKey.values()];
}

export function planIntercity(
  query: IntercityQuery,
  snapshot: DataSnapshot,
  strategy: IntercityStrategy,
): NextMove[] {
  const candidates = dedupeBest([
    ...directJourneys(query, snapshot),
    ...transferJourneys(query, snapshot),
  ]);
  if (candidates.length === 0) return [];

  const comparators: Record<
    IntercityStrategy,
    (a: JourneyCandidate, b: JourneyCandidate) => number
  > = {
    fastest: (a, b) =>
      a.arriveAtMinutes - b.arriveAtMinutes ||
      a.move.transfers - b.move.transfers,
    cheapest: (a, b) =>
      fareMid(a.move.totalFare.min, a.move.totalFare.max) -
        fareMid(b.move.totalFare.min, b.move.totalFare.max) ||
      a.arriveAtMinutes - b.arriveAtMinutes,
    balanced: (a, b) =>
      balancedCost(a) - balancedCost(b) || a.arriveAtMinutes - b.arriveAtMinutes,
  };

  function balancedCost(c: JourneyCandidate): number {
    return (
      c.arriveAtMinutes -
      query.when.minutes +
      fareMid(c.move.totalFare.min, c.move.totalFare.max) * 0.6 +
      c.move.transfers * 25
    );
  }

  const sorted = [...candidates].sort(comparators[strategy]);
  const winner = sorted[0];

  if (strategy === "fastest") winner.move.reasons.push("fastest");
  if (strategy === "cheapest") winner.move.reasons.push("cheapest");
  if (winner.move.transfers === 0) winner.move.reasons.push("direct-route");

  return sorted.map((c) => c.move);
}
