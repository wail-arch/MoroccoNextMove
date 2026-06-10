import type { ConfidenceTier } from "../types";

const TIER_ORDER: Record<ConfidenceTier, number> = {
  "official-live": 0,
  "cached-verified": 1,
  "estimated-flagged": 2,
};

/** A multi-leg journey is only as trustworthy as its weakest leg. */
export function weakestTier(tiers: ConfidenceTier[]): ConfidenceTier {
  let worst: ConfidenceTier = "official-live";
  for (const tier of tiers) {
    if (TIER_ORDER[tier] > TIER_ORDER[worst]) {
      worst = tier;
    }
  }
  return worst;
}

/** Days after which "cached & verified" stops being an honest label. */
const STALENESS_LIMIT_DAYS = 270;

/** Degrade a tier when its verification date is too old. `todayIso` comes
 * from the caller so the function stays deterministic. */
export function effectiveTier(
  tier: ConfidenceTier,
  lastVerifiedAt: string,
  todayIso: string,
): ConfidenceTier {
  if (tier !== "cached-verified") {
    return tier;
  }
  const ageDays =
    (Date.parse(todayIso) - Date.parse(lastVerifiedAt)) / 86_400_000;
  return ageDays > STALENESS_LIMIT_DAYS ? "estimated-flagged" : tier;
}

export function oldestDate(dates: string[]): string {
  return dates.reduce((oldest, date) => (date < oldest ? date : oldest));
}

/** Penalty in "equivalent traveler minutes" for uncertainty. */
export function tierPenaltyMinutes(tier: ConfidenceTier): number {
  switch (tier) {
    case "official-live":
      return 0;
    case "cached-verified":
      return 8;
    case "estimated-flagged":
      return 22;
  }
}
