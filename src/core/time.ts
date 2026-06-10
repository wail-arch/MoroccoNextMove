import type { DayMask } from "./types";

/** Parse "HH:MM" into minutes since midnight. Accepts hours ≥ 24 the way
 * GTFS does (a 25:10 departure is 01:10 the next service day). */
export function parseHHMM(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function isNight(minutes: number): boolean {
  return minutes >= 21 * 60 || minutes < 6 * 60;
}

export function runsOnDay(days: DayMask, dayOfWeek: number): boolean {
  return days[((dayOfWeek % 7) + 7) % 7] ?? false;
}

export const DAILY: DayMask = [true, true, true, true, true, true, true];
export const WEEKDAYS: DayMask = [true, true, true, true, true, false, false];
export const WEEKEND: DayMask = [false, false, false, false, false, true, true];
