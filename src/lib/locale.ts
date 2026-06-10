import type { LocalizedString } from "@/core/types";

export type UiLocale = "en" | "fr" | "ar";

export function pickLocale(value: LocalizedString, locale: string): string {
  if (locale === "fr") return value.fr;
  if (locale === "ar") return value.ar;
  return value.en;
}
