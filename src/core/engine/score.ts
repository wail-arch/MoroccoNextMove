import type { AdvisorySeverity, BudgetPref, ConfidenceTier } from "../types";
import { tierPenaltyMinutes } from "./confidence";

/*
 * Scoring converts everything a traveler cares about into one comparable
 * unit: "equivalent minutes of traveler cost". Time counts at face value;
 * money, uncertainty, transfers, and discomfort are converted into minutes.
 * Lower is better.
 */

/** How many equivalent minutes one dirham costs, by budget preference.
 * A lean traveler treats 10 MAD like 12 minutes; a premium traveler barely
 * notices it. */
const MAD_TO_MINUTES: Record<BudgetPref, number> = {
  lean: 1.2,
  mid: 0.6,
  premium: 0.25,
};

const TRANSFER_PENALTY_MINUTES = 8;
const NIGHT_LONG_WALK_PENALTY_MINUTES = 25;
const NIGHT_LONG_WALK_THRESHOLD_M = 500;

const SEVERITY_PENALTY_MINUTES: Record<AdvisorySeverity, number> = {
  info: 0,
  caution: 5,
  warning: 15,
};

export interface ScoreInput {
  durationMinutes: number;
  /** Midpoint of the total fare band, in MAD. */
  fareMidMad: number;
  transfers: number;
  walkMeters: number;
  tier: ConfidenceTier;
  maxAdvisorySeverity: AdvisorySeverity | null;
  night: boolean;
  budget: BudgetPref;
  /** Minutes until the first scheduled departure (0 for walk/taxi). */
  waitMinutes: number;
}

export function computeScore(input: ScoreInput): number {
  let score = input.durationMinutes + input.waitMinutes;

  score += input.fareMidMad * MAD_TO_MINUTES[input.budget];
  score += input.transfers * TRANSFER_PENALTY_MINUTES;

  // Walking discomfort beyond the time it already costs (heat, luggage,
  // wayfinding stress). Doubled at night.
  score += (input.walkMeters / 150) * (input.night ? 2 : 1);

  if (input.night && input.walkMeters > NIGHT_LONG_WALK_THRESHOLD_M) {
    score += NIGHT_LONG_WALK_PENALTY_MINUTES;
  }

  score += tierPenaltyMinutes(input.tier);

  if (input.maxAdvisorySeverity) {
    score += SEVERITY_PENALTY_MINUTES[input.maxAdvisorySeverity];
  }

  return Math.round(score * 10) / 10;
}

export function fareMid(min: number, max: number): number {
  return (min + max) / 2;
}
