import type { FareBand } from "@/core/types";

const CURRENCY_LABEL: Record<string, string> = {
  en: "MAD",
  fr: "MAD",
  ar: "درهم",
};

export function formatFare(fare: FareBand, locale: string): string {
  const unit = CURRENCY_LABEL[locale] ?? "MAD";
  if (fare.max === 0) return "";
  if (fare.min === fare.max) return `${fare.min} ${unit}`;
  return `${fare.min}–${fare.max} ${unit}`;
}
