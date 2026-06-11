/** Bump when seed content changes so clients silently re-sync their packs. */
export const PACK_VERSION = "2026-06-11.3";

export const PACK_CITIES = ["marrakech", "casablanca", "rabat"] as const;
export type PackCity = (typeof PACK_CITIES)[number];

export function isPackCity(value: string): value is PackCity {
  return (PACK_CITIES as readonly string[]).includes(value);
}
