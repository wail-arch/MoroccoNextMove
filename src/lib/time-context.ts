import type { RankContext } from "@/core/types";

const DAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** Current wall-clock context in Morocco (Africa/Casablanca), in the shape
 * the timezone-free engine expects. */
export function moroccoNow(): RankContext["when"] {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Casablanca",
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );

  // en-GB can render midnight as "24"; normalize.
  const hour = Number(parts.hour) % 24;

  return {
    dayOfWeek: DAY_INDEX[parts.weekday] ?? 0,
    minutes: hour * 60 + Number(parts.minute),
    todayIso: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

/** Apply an optional "HH:MM" departure override from the URL. */
export function withDepartureOverride(
  when: RankContext["when"],
  at?: string,
): RankContext["when"] {
  if (!at || !/^\d{2}:\d{2}$/.test(at)) return when;
  const [h, m] = at.split(":").map(Number);
  if (h > 23 || m > 59) return when;
  return { ...when, minutes: h * 60 + m };
}
