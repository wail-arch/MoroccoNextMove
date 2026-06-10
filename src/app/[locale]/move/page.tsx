import type { Metadata } from "next";
import { ArrowDownUp, Navigation } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { rankNextMoves, type BudgetPref, type CityId, type Place } from "@/core";
import { getBaseSnapshot } from "@/data";
import { getPathname } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import { moroccoNow, withDepartureOverride } from "@/lib/time-context";
import { Button } from "@/ui/Button";
import { MoveResults } from "./MoveResults";

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

  const { from, to, budget, at } = await searchParams;
  const snapshot = getBaseSnapshot();

  const placesByCity = new Map<CityId, Place[]>();
  for (const city of CITY_ORDER) placesByCity.set(city, []);
  for (const place of snapshot.places) {
    placesByCity.get(place.city)?.push(place);
  }

  const origin = snapshot.places.find((p) => p.id === from);
  const destination = snapshot.places.find((p) => p.id === to);
  const hasQuery = Boolean(origin && destination && origin.id !== destination.id);

  const moves = hasQuery
    ? rankNextMoves(
        {
          origin: { point: origin!.point, placeId: origin!.id },
          destination: { point: destination!.point, placeId: destination!.id },
          when: withDepartureOverride(moroccoNow(), at),
          connectivity: "online",
          prefs: { budget: asBudget(budget) },
        },
        snapshot,
      )
    : [];

  const action = getPathname({ locale, href: "/move" });

  const selectClass =
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
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
              {t("whereAreYou")}
            </span>
            <select
              name="from"
              required
              defaultValue={origin?.id ?? ""}
              className={selectClass}
            >
              <option value="" disabled>
                {t("pickPlace")}
              </option>
              {CITY_ORDER.map((city) => {
                const places = placesByCity.get(city) ?? [];
                if (places.length === 0) return null;
                return (
                  <optgroup key={city} label={tCity(city)}>
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {pickLocale(p.name, locale)}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </label>

          <span aria-hidden className="mx-auto -my-1 text-ink-faint">
            <ArrowDownUp className="h-4 w-4" />
          </span>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
              {t("whereTo")}
            </span>
            <select
              name="to"
              required
              defaultValue={destination?.id ?? ""}
              className={selectClass}
            >
              <option value="" disabled>
                {t("pickPlace")}
              </option>
              {CITY_ORDER.map((city) => {
                const places = placesByCity.get(city) ?? [];
                if (places.length === 0) return null;
                return (
                  <optgroup key={city} label={tCity(city)}>
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {pickLocale(p.name, locale)}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
                {t("budget")}
              </span>
              <select
                name="budget"
                defaultValue={asBudget(budget)}
                className={selectClass}
              >
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
                className={selectClass}
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
              from: pickLocale(origin!.name, locale),
              to: pickLocale(destination!.name, locale),
            })}
          </h2>
          <p className="mb-4 mt-1 text-[13px] text-ink-faint">{tCard("fareNote")}</p>
          {moves.length > 0 ? (
            <MoveResults
              moves={moves}
              fromLabel={pickLocale(origin!.name, locale)}
              toLabel={pickLocale(destination!.name, locale)}
              trackEvent="move_result_shown"
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
