import { haversineMeters, walkingDistanceMeters, walkingMinutes } from "../geo";
import { isNight, parseHHMM, runsOnDay, toHHMM } from "../time";
import type {
  CityId,
  DataSnapshot,
  FareBand,
  Leg,
  Line,
  LocalizedString,
  NextMove,
  PaymentMode,
  Place,
  RankContext,
  Stop,
  VerifiedPin,
} from "../types";
import { effectiveTier, oldestDate, weakestTier } from "./confidence";

/*
 * Candidate builders: each returns raw NextMove drafts (no score, no
 * advisories, no comparative reasons — rank.ts adds those).
 */

const MAX_WALK_MOVE_METERS = 2_500;
const MAX_WALK_TO_STOP_METERS = 900;
const BOARDING_BUFFER_MINUTES = 3;
const TAXI_HAIL_WAIT_MINUTES = 5;
const TAXI_SPEED_KM_PER_MIN = 0.45; // ~27 km/h urban average
const NIGHT_FARE_FROM_MINUTES = 20 * 60;
const NIGHT_FARE_TO_MINUTES = 6 * 60;

export interface CandidateDraft {
  move: Omit<NextMove, "score" | "advisories" | "reasons">;
  waitMinutes: number;
}

// ---------------------------------------------------------------------------
// Shared lookups
// ---------------------------------------------------------------------------

function placeById(snapshot: DataSnapshot, id?: string): Place | undefined {
  return id ? snapshot.places.find((p) => p.id === id) : undefined;
}

export function nearestCity(
  snapshot: DataSnapshot,
  point: { lat: number; lon: number },
): CityId {
  let best: { city: CityId; distance: number } | null = null;
  for (const place of snapshot.places) {
    if (place.city === "intercity") continue;
    const distance = haversineMeters(point, place.point);
    if (!best || distance < best.distance) {
      best = { city: place.city, distance };
    }
  }
  return best?.city ?? "intercity";
}

function isMedinaContext(
  snapshot: DataSnapshot,
  point: { lat: number; lon: number },
  placeId?: string,
): boolean {
  const place = placeById(snapshot, placeId);
  if (place) return place.inMedina;
  return snapshot.places.some(
    (p) => p.inMedina && haversineMeters(point, p.point) < 800,
  );
}

function pinForDestination(
  snapshot: DataSnapshot,
  placeId?: string,
): VerifiedPin | undefined {
  if (!placeId) return undefined;
  return snapshot.pins.find((pin) => pin.placeId === placeId);
}

function endpointName(
  snapshot: DataSnapshot,
  placeId: string | undefined,
  fallback: LocalizedString,
): LocalizedString {
  return placeById(snapshot, placeId)?.name ?? fallback;
}

const YOUR_LOCATION: LocalizedString = {
  en: "Your location",
  fr: "Votre position",
  ar: "موقعك الحالي",
};

const DESTINATION: LocalizedString = {
  en: "Your destination",
  fr: "Votre destination",
  ar: "وجهتك",
};

const ZERO_FARE: FareBand = { currency: "MAD", min: 0, max: 0, per: "person" };

function sumFares(legs: Leg[]): FareBand {
  let min = 0;
  let max = 0;
  for (const leg of legs) {
    if (leg.fare) {
      min += leg.fare.min;
      max += leg.fare.max;
    }
  }
  return { currency: "MAD", min, max, per: "person" };
}

function unionPayments(legs: Leg[]): PaymentMode[] {
  const set = new Set<PaymentMode>();
  for (const leg of legs) {
    for (const mode of leg.paymentModes ?? []) set.add(mode);
  }
  return [...set];
}

function assembleMove(
  id: string,
  headlineMode: NextMove["headlineMode"],
  legs: Leg[],
  waitMinutes: number,
  deepLink?: NextMove["deepLink"],
): CandidateDraft {
  const transfers = Math.max(
    0,
    legs.filter((l) => l.mode !== "walk").length - 1,
  );
  return {
    move: {
      id,
      headlineMode,
      legs,
      totalDurationMinutes:
        legs.reduce((sum, l) => sum + l.durationMinutes, 0) + waitMinutes,
      totalFare: legs.some((l) => l.fare) ? sumFares(legs) : ZERO_FARE,
      paymentModes: unionPayments(legs),
      tier: weakestTier(legs.map((l) => l.tier)),
      lastVerifiedAt: oldestDate(legs.map((l) => l.lastVerifiedAt)),
      transfers,
      deepLink,
    },
    waitMinutes,
  };
}

// ---------------------------------------------------------------------------
// Walk
// ---------------------------------------------------------------------------

export function buildWalkCandidate(
  ctx: RankContext,
  snapshot: DataSnapshot,
): CandidateDraft | null {
  const medina =
    isMedinaContext(snapshot, ctx.destination.point, ctx.destination.placeId) ||
    isMedinaContext(snapshot, ctx.origin.point, ctx.origin.placeId);

  const distance = walkingDistanceMeters(
    ctx.origin.point,
    ctx.destination.point,
    { medina },
  );
  if (distance > MAX_WALK_MOVE_METERS) return null;

  const pin = pinForDestination(snapshot, ctx.destination.placeId);
  const destPlace = placeById(snapshot, ctx.destination.placeId);

  // A plain GPS walk into a medina is exactly where navigation fails — be
  // honest about that unless a verified pin covers the approach.
  const tier = pin
    ? pin.tier
    : medina
      ? "estimated-flagged"
      : "cached-verified";

  const leg: Leg = {
    mode: "walk",
    from: {
      name: endpointName(snapshot, ctx.origin.placeId, YOUR_LOCATION),
      point: ctx.origin.point,
    },
    to: {
      name: endpointName(snapshot, ctx.destination.placeId, DESTINATION),
      point: pin?.point ?? ctx.destination.point,
    },
    durationMinutes: walkingMinutes(distance),
    distanceMeters: distance,
    tier,
    lastVerifiedAt:
      pin?.provenance.lastVerifiedAt ??
      destPlace?.provenance.lastVerifiedAt ??
      ctx.when.todayIso,
    walkingNote: pin?.walkingNote,
  };

  return assembleMove("walk-direct", "walk", [leg], 0);
}

// ---------------------------------------------------------------------------
// Taxi
// ---------------------------------------------------------------------------

export function buildTaxiCandidates(
  ctx: RankContext,
  snapshot: DataSnapshot,
): CandidateDraft[] {
  const city = nearestCity(snapshot, ctx.origin.point);
  const night =
    ctx.when.minutes >= NIGHT_FARE_FROM_MINUTES ||
    ctx.when.minutes < NIGHT_FARE_TO_MINUTES;

  const drafts: CandidateDraft[] = [];
  for (const rule of snapshot.taxiRules) {
    if (rule.city !== city) continue;

    const roadMeters = Math.round(
      haversineMeters(ctx.origin.point, ctx.destination.point) * 1.4,
    );
    const km = roadMeters / 1000;
    const band = rule.bands.find((b) => km <= b.maxKm);
    if (!band) continue; // trip too long for this taxi kind

    const multiplier = night ? rule.nightMultiplier : 1;
    const fare: FareBand = {
      currency: "MAD",
      min: Math.round(band.fare.min * multiplier),
      max: Math.round(band.fare.max * multiplier),
      per: band.fare.per,
    };

    const rideMinutes = Math.max(4, Math.round(km / TAXI_SPEED_KM_PER_MIN));
    const tier = effectiveTier(
      rule.tier,
      rule.provenance.lastVerifiedAt,
      ctx.when.todayIso,
    );

    const leg: Leg = {
      mode: rule.kind,
      from: {
        name: endpointName(snapshot, ctx.origin.placeId, YOUR_LOCATION),
        point: ctx.origin.point,
      },
      to: {
        name: endpointName(snapshot, ctx.destination.placeId, DESTINATION),
        point: ctx.destination.point,
      },
      durationMinutes: rideMinutes,
      distanceMeters: roadMeters,
      fare,
      paymentModes: rule.paymentModes,
      tier,
      lastVerifiedAt: rule.provenance.lastVerifiedAt,
    };

    drafts.push(
      assembleMove(`taxi-${rule.id}`, rule.kind, [leg], TAXI_HAIL_WAIT_MINUTES),
    );
  }
  return drafts;
}

// ---------------------------------------------------------------------------
// Scheduled transit (tram / train / coach / bus)
// ---------------------------------------------------------------------------

interface BoardingPlan {
  fromStop: Stop;
  toStop: Stop;
  departAtMinutes: number;
  arriveAtMinutes: number;
  tripId?: string;
  headwayMinutes?: number;
}

function stopById(snapshot: DataSnapshot, id: string): Stop | undefined {
  return snapshot.stops.find((s) => s.id === id);
}

/** Earliest usable ride on `line` between two stops after `earliest`
 * (minutes since midnight), or null when none runs today. */
export function nextRide(
  line: Line,
  fromStopIdx: number,
  toStopIdx: number,
  earliestMinutes: number,
  dayOfWeek: number,
  snapshot: DataSnapshot,
): BoardingPlan | null {
  const fromStopId = line.stopIds[fromStopIdx];
  const toStopId = line.stopIds[toStopIdx];
  const fromStop = stopById(snapshot, fromStopId);
  const toStop = stopById(snapshot, toStopId);
  if (!fromStop || !toStop) return null;

  if (line.service.kind === "headway") {
    const svc = line.service;
    if (!runsOnDay(svc.days, dayOfWeek)) return null;
    const first = parseHHMM(svc.firstDeparture);
    const last = parseHHMM(svc.lastDeparture);
    if (earliestMinutes > last) return null;

    const base = Math.max(first, earliestMinutes);
    const slotsAfterFirst = Math.ceil((base - first) / svc.headwayMinutes);
    const departAt = first + slotsAfterFirst * svc.headwayMinutes;
    if (departAt > last) return null;

    const hops = Math.abs(toStopIdx - fromStopIdx);
    return {
      fromStop,
      toStop,
      departAtMinutes: departAt,
      arriveAtMinutes: departAt + hops * svc.minutesBetweenStops,
      headwayMinutes: svc.headwayMinutes,
    };
  }

  // Timetable service: trips encode direction via stop order.
  let best: BoardingPlan | null = null;
  for (const trip of line.service.trips) {
    if (!runsOnDay(trip.days, dayOfWeek)) continue;
    const fromIdx = trip.stopTimes.findIndex((st) => st.stopId === fromStopId);
    const toIdx = trip.stopTimes.findIndex((st) => st.stopId === toStopId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) continue;

    const departAt = parseHHMM(trip.stopTimes[fromIdx].time);
    if (departAt < earliestMinutes) continue;

    const arriveAt = parseHHMM(trip.stopTimes[toIdx].time);
    if (!best || departAt < best.departAtMinutes) {
      best = {
        fromStop,
        toStop,
        departAtMinutes: departAt,
        arriveAtMinutes: arriveAt,
        tripId: trip.tripId,
      };
    }
  }
  return best;
}

export function buildTransitCandidates(
  ctx: RankContext,
  snapshot: DataSnapshot,
): CandidateDraft[] {
  const drafts: CandidateDraft[] = [];

  for (const line of snapshot.lines) {
    // Closest reachable boarding/alighting stops on this line.
    let board: { idx: number; stop: Stop; walkM: number } | null = null;
    let alight: { idx: number; stop: Stop; walkM: number } | null = null;

    line.stopIds.forEach((stopId, idx) => {
      const stop = stopById(snapshot, stopId);
      if (!stop) return;
      const walkFromOrigin = walkingDistanceMeters(
        ctx.origin.point,
        stop.point,
        { medina: false },
      );
      const walkToDestination = walkingDistanceMeters(
        stop.point,
        ctx.destination.point,
        { medina: false },
      );
      if (
        walkFromOrigin <= MAX_WALK_TO_STOP_METERS &&
        (!board || walkFromOrigin < board.walkM)
      ) {
        board = { idx, stop, walkM: walkFromOrigin };
      }
      if (
        walkToDestination <= MAX_WALK_TO_STOP_METERS &&
        (!alight || walkToDestination < alight.walkM)
      ) {
        alight = { idx, stop, walkM: walkToDestination };
      }
    });

    if (!board || !alight) continue;
    const boarding = board as { idx: number; stop: Stop; walkM: number };
    const alighting = alight as { idx: number; stop: Stop; walkM: number };
    if (boarding.idx === alighting.idx) continue;

    const walkToStopMin = walkingMinutes(boarding.walkM);
    const ride = nextRide(
      line,
      boarding.idx,
      alighting.idx,
      ctx.when.minutes + walkToStopMin + BOARDING_BUFFER_MINUTES,
      ctx.when.dayOfWeek,
      snapshot,
    );
    if (!ride) continue;

    const lineTier = effectiveTier(
      line.tier,
      line.provenance.lastVerifiedAt,
      ctx.when.todayIso,
    );

    const legs: Leg[] = [];
    if (boarding.walkM > 50) {
      legs.push({
        mode: "walk",
        from: {
          name: endpointName(snapshot, ctx.origin.placeId, YOUR_LOCATION),
          point: ctx.origin.point,
        },
        to: {
          name: ride.fromStop.name,
          point: ride.fromStop.point,
          stopId: ride.fromStop.id,
        },
        durationMinutes: walkToStopMin,
        distanceMeters: boarding.walkM,
        tier: "cached-verified",
        lastVerifiedAt: line.provenance.lastVerifiedAt,
      });
    }

    legs.push({
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
      tier: lineTier,
      lastVerifiedAt: line.provenance.lastVerifiedAt,
    });

    if (alighting.walkM > 50) {
      const pin = pinForDestination(snapshot, ctx.destination.placeId);
      const medina = isMedinaContext(
        snapshot,
        ctx.destination.point,
        ctx.destination.placeId,
      );
      legs.push({
        mode: "walk",
        from: {
          name: ride.toStop.name,
          point: ride.toStop.point,
          stopId: ride.toStop.id,
        },
        to: {
          name: endpointName(snapshot, ctx.destination.placeId, DESTINATION),
          point: pin?.point ?? ctx.destination.point,
        },
        durationMinutes: walkingMinutes(alighting.walkM),
        distanceMeters: alighting.walkM,
        tier: pin ? pin.tier : medina ? "estimated-flagged" : "cached-verified",
        lastVerifiedAt:
          pin?.provenance.lastVerifiedAt ?? line.provenance.lastVerifiedAt,
        walkingNote: pin?.walkingNote,
      });
    }

    let waitMinutes = Math.max(
      0,
      ride.departAtMinutes - ctx.when.minutes - walkToStopMin,
    );
    if (ride.headwayMinutes) {
      // Frequent services shouldn't be punished for grid alignment: cap the
      // perceived wait at one headway.
      waitMinutes = Math.min(waitMinutes, ride.headwayMinutes);
    }

    drafts.push(
      assembleMove(
        `${line.mode}-${line.id}`,
        line.mode,
        legs,
        waitMinutes,
        line.deepLink,
      ),
    );
  }

  return drafts;
}

export function isNightContext(ctx: RankContext): boolean {
  return isNight(ctx.when.minutes);
}
