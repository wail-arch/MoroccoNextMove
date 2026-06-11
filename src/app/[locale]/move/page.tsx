import type { Metadata } from "next";
import { Navigation } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  rankNextMoves,
  type BudgetPref,
  type CityId,
  type GeoPoint,
  type Place,
} from "@/core";
import { getBaseSnapshot } from "@/data";
import { getPathname } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import { moroccoNow, withDepartureOverride } from "@/lib/time-context";
import { Button } from "@/ui/Button";
import { PlacePicker, type PickerPlace } from "@/ui/PlacePicker";
import { MoveResults } from "./MoveResults";
import { UseLocationButton } from "./UseLocationButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "move" });
  return { title: t("title"), description: t("subtitle") };
}

type SearchParams = Promise<{
  from?: string;
  fromLat?: string;
  fromLon?: string;
  to?: string;
  budget?: string;
  at?: string;
}>;

const CITY_ORDER: CityId[] = [
  "marrakech",
  "casablanca",
  "rabat",
  "tangier",
  "fes",
  "intercity",
];

function asBudget(value: string | undefined): BudgetPref {
  return value === "lean" || value === "premium" ? value : "mid";
}

function parseCoord(value: string | undefined, min: number, max: number) {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) && num >= min && num <= max ? num : undefined;
}

export default async function MovePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("move");
  const tCommon = await getTranslations("common");
  const tCard = await getTranslations("card");
  const tCity = await getTranslations("cityNames");

  const { from, fromLat, fromLon, to, budget, at } = await searchParams;
  const snapshot = getBaseSnapshot();

  // Picker data, ordered by city (small: id + labels + search haystack).
  const cityRank = new Map(CITY_ORDER.map((c, i) => [c, i]));
  const pickerPlaces: PickerPlace[] = [...snapshot.places]
    .sort(
      (a, b) =>
        (cityRank.get(a.city) ?? 99) - (cityRank.get(b.city) ?? 99) ||
        a.id.localeCompare(b.id),
    )
    .map((p) => ({
      id: p.id,
      label: pickLocale(p.name, locale),
      cityLabel: tCity(p.city),
      isArea: p.kind === "accommodation-area",
      searchText: [p.name.en, p.name.fr, p.name.ar, ...p.aliases]
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, ""),
    }));

  const locatorPlaces = snapshot.places.map((p) => ({
    id: p.id,
    lat: p.point.lat,
    lon: p.point.lon,
  }));

  // Origin: a known place, or raw coordinates from "use my location".
  const originPlace: Place | undefined = snapshot.places.find(
    (p) => p.id === from,
  );
  const lat = parseCoord(fromLat, -90, 90);
  const lon = parseCoord(fromLon, -180, 180);
  const rawOrigin: GeoPoint | undefined =
    lat !== undefined && lon !== undefined ? { lat, lon } : undefined;

  const destination = snapshot.places.find((p) => p.id === to);
  const originPoint = originPlace?.point ?? rawOrigin;
  const hasQuery = Boolean(
    originPoint && destination && originPlace?.id !== destination?.id,
  );

  const moves = hasQuery
    ? rankNextMoves(
        {
          origin: { point: originPoint!, placeId: originPlace?.id },
          destination: { point: destination!.point, placeId: destination!.id },
          when: withDepartureOverride(moroccoNow(), at),
          connectivity: "online",
          prefs: { budget: asBudget(budget) },
        },
        snapshot,
      )
    : [];

  const fromLabel = originPlace
    ? pickLocale(originPlace.name, locale)
    : t("myLocation");

  const action = getPathname({ locale, href: "/move" });
  const inputClass =
    "h-12 w-full appearance-none rounded-xl border border-line bg-card px-3 text-sm font-medium text-ink outline-none focus:border-zellige";

  return (
    <main id="content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-zellige-strong sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-7 text-ink-muted">
          {t("subtitle")}
        </p>
      </header>

      <form
        action={action}
        method="GET"
        className="mt-6 rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-3">
          <div>
            <PlacePicker
              name="from"
              label={t("whereAreYou")}
              places={pickerPlaces}
              initialId={originPlace?.id}
            />
            <div className="mt-1">
              <UseLocationButton places={locatorPlaces} />
            </div>
          </div>

          <PlacePicker
            name="to"
            label={t("whereTo")}
            places={pickerPlaces}
            initialId={destination?.id}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
                {t("budget")}
              </span>
              <select name="budget" defaultValue={asBudget(budget)} className={inputClass}>
                <option value="lean">{t("budgetLean")}</option>
                <option value="mid">{t("budgetMid")}</option>
                <option value="premium">{t("budgetPremium")}</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
                {t("departureTime")}
              </span>
              <input
                type="time"
                name="at"
                defaultValue={at ?? ""}
                placeholder={t("timeNow")}
                className={inputClass}
              />
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" className="mt-1 w-full">
            <Navigation className="h-4 w-4" aria-hidden />
            {t("findMove")}
          </Button>
        </div>
      </form>

      {hasQuery && (
        <section className="mt-8" aria-live="polite">
          <h2 className="text-lg font-bold text-ink">
            {t("resultsFor", {
              from: fromLabel,
              to: pickLocale(destination!.name, locale),
            })}
          </h2>
          <p className="mb-4 mt-1 text-[13px] text-ink-faint">{tCard("fareNote")}</p>
          {moves.length > 0 ? (
            <MoveResults
              moves={moves}
              fromLabel={fromLabel}
              toLabel={pickLocale(destination!.name, locale)}
              trackEvent="move_result_shown"
              query={{
                source: "move",
                fromId: originPlace?.id,
                toId: destination!.id,
                budget: asBudget(budget),
              }}
            />
          ) : (
            <div className="rounded-2xl border border-line bg-card p-6 text-center text-sm leading-6 text-ink-muted">
              {tCard("noMoves")}
            </div>
          )}
          <p className="mt-4 text-center text-[12px] text-ink-faint">
            {tCommon("today")} · Africa/Casablanca
          </p>
        </section>
      )}
    </main>
  );
}
