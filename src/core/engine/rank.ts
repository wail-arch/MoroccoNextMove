import type {
  AdvisoryNote,
  AdvisorySeverity,
  DataSnapshot,
  NextMove,
  RankContext,
  ReasonCode,
} from "../types";
import {
  buildTaxiCandidates,
  buildTransitCandidates,
  buildWalkCandidate,
  isNightContext,
  nearestCity,
  type CandidateDraft,
} from "./candidates";
import { computeScore, fareMid } from "./score";

const SEVERITY_RANK: Record<AdvisorySeverity, number> = {
  info: 0,
  caution: 1,
  warning: 2,
};

function matchAdvisories(
  draft: CandidateDraft,
  ctx: RankContext,
  snapshot: DataSnapshot,
): AdvisoryNote[] {
  const city = nearestCity(snapshot, ctx.origin.point);
  const moveModes = new Set(draft.move.legs.map((l) => l.mode));
  const movePlaceIds = new Set(
    [
      ctx.origin.placeId,
      ctx.destination.placeId,
      ...draft.move.legs.flatMap((l) => [l.from.stopId, l.to.stopId]),
    ].filter((id): id is string => Boolean(id)),
  );

  return snapshot.advisories.filter((advisory) => {
    const { modes, cities, placeIds, hours } = advisory.appliesTo;

    if (modes && !modes.some((m) => moveModes.has(m))) return false;
    if (cities && !cities.includes(city)) return false;
    if (placeIds && !placeIds.some((id) => movePlaceIds.has(id))) return false;
    if (hours) {
      const now = ctx.when.minutes;
      const inWindow =
        hours.fromMinutes <= hours.toMinutes
          ? now >= hours.fromMinutes && now < hours.toMinutes
          : now >= hours.fromMinutes || now < hours.toMinutes; // wraps midnight
      if (!inWindow) return false;
    }
    return true;
  });
}

function maxSeverity(advisories: AdvisoryNote[]): AdvisorySeverity | null {
  let max: AdvisorySeverity | null = null;
  for (const a of advisories) {
    if (!max || SEVERITY_RANK[a.severity] > SEVERITY_RANK[max]) {
      max = a.severity;
    }
  }
  return max;
}

function intrinsicReasons(
  draft: CandidateDraft,
  ctx: RankContext,
  night: boolean,
): ReasonCode[] {
  const reasons: ReasonCode[] = [];
  const move = draft.move;
  const walkMeters = move.legs
    .filter((l) => l.mode === "walk")
    .reduce((sum, l) => sum + (l.distanceMeters ?? 0), 0);

  if (move.headlineMode === "walk") {
    reasons.push("works-offline");
    if (walkMeters < 600) reasons.push("short-walk");
  }
  if (
    night &&
    (move.headlineMode === "petit-taxi" || move.headlineMode === "grand-taxi")
  ) {
    reasons.push("night-safer");
  }
  if (move.legs.some((l) => l.walkingNote)) {
    reasons.push("verified-entrance");
  }

  const scheduled = move.legs.find((l) => l.departAt);
  if (scheduled && draft.waitMinutes <= 10) {
    reasons.push("departs-soon");
  }

  const headwayLeg = move.legs.find((l) => l.mode === "tram" || l.mode === "bus");
  if (headwayLeg && draft.waitMinutes <= 12 && move.headlineMode !== "walk") {
    reasons.push("frequent-service");
  }

  if (move.transfers === 0 && scheduled) {
    reasons.push("direct-route");
  }

  void ctx;
  return reasons;
}

/** Comparative reasons need the whole candidate set. */
function comparativeReasons(moves: NextMove[]): void {
  if (moves.length === 0) return;

  const fastest = moves.reduce((a, b) =>
    b.totalDurationMinutes < a.totalDurationMinutes ? b : a,
  );
  fastest.reasons.unshift("fastest");

  const pricedMoves = moves.filter((m) => m.totalFare.max > 0);
  const cheapest =
    pricedMoves.length > 0
      ? moves.reduce((a, b) =>
          fareMid(b.totalFare.min, b.totalFare.max) <
          fareMid(a.totalFare.min, a.totalFare.max)
            ? b
            : a,
        )
      : null;
  if (cheapest && !cheapest.reasons.includes("fastest")) {
    cheapest.reasons.unshift("cheapest");
  }

  // De-duplicate while preserving order.
  for (const move of moves) {
    move.reasons = [...new Set(move.reasons)];
  }
}

/**
 * The product, as a function: from this context and this data snapshot,
 * what are the traveler's best next moves, in order?
 */
export function rankNextMoves(
  ctx: RankContext,
  snapshot: DataSnapshot,
): NextMove[] {
  const night = isNightContext(ctx);

  const drafts: CandidateDraft[] = [
    ...[buildWalkCandidate(ctx, snapshot)].filter(
      (d): d is CandidateDraft => d !== null,
    ),
    ...buildTaxiCandidates(ctx, snapshot),
    ...buildTransitCandidates(ctx, snapshot),
  ];

  const moves: NextMove[] = drafts.map((draft) => {
    const advisories = matchAdvisories(draft, ctx, snapshot);
    const walkMeters = draft.move.legs
      .filter((l) => l.mode === "walk")
      .reduce((sum, l) => sum + (l.distanceMeters ?? 0), 0);

    const score = computeScore({
      durationMinutes: draft.legsDurationMinutes,
      fareMidMad: fareMid(draft.move.totalFare.min, draft.move.totalFare.max),
      transfers: draft.move.transfers,
      walkMeters,
      tier: draft.move.tier,
      maxAdvisorySeverity: maxSeverity(advisories),
      night,
      budget: ctx.prefs.budget,
      waitMinutes: draft.waitMinutes,
    });

    return {
      ...draft.move,
      advisories,
      reasons: intrinsicReasons(draft, ctx, night),
      score,
    };
  });

  moves.sort((a, b) => a.score - b.score);
  comparativeReasons(moves);
  return moves;
}
