import type { Metadata } from "next";
import { TrainFront } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  planIntercity,
  type CityId,
  type IntercityStrategy,
  type Stop,
} from "@/core";
import { getBaseSnapshot, getIntercityStops } from "@/data";
import { getPathname } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import { moroccoNow, shiftDays, withDepartureOverride } from "@/lib/time-context";
import { Button } from "@/ui/Button";
import { MoveResults } from "../move/MoveResults";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plan" });
  return { title: t("title"), description: t("subtitle") };
}

type SearchParams = Promise<{
  from?: string;
  to?: string;
  strategy?: string;
  at?: string;
  day?: string;
}>;

const CITY_ORDER: CityId[] = [
  "casablanca",
  "marrakech",
  "rabat",
  "tangier",
  "fes",
  "intercity",
];

function asStrategy(value: string | undefined): IntercityStrategy {
  return value === "cheapest" || value === "balanced" ? value : "fastest";
}

export default async function PlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("plan");
  const tCard = await getTranslations("card");
  const tCity = await getTranslations("cityNames");
  const tCommon = await getTranslations("common");

  const { from, to, strategy: strategyParam, at, day } = await searchParams;
  const strategy = asStrategy(strategyParam);
  const tomorrow = day === "tomorrow";
  const snapshot = getBaseSnapshot();
  const stations = getIntercityStops();

  const stationsByCity = new Map<CityId, Stop[]>();
  for (const city of CITY_ORDER) stationsByCity.set(city, []);
  for (const stop of stations) {
    stationsByCity.get(stop.city)?.push(stop);
  }

  const origin = stations.find((s) => s.id === from);
  const destination = stations.find((s) => s.id === to);
  const hasQuery = Boolean(origin && destination && origin.id !== destination.id);

  const moves = hasQuery
    ? planIntercity(
        {
          fromStopId: origin!.id,
          toStopId: destination!.id,
          // Tomorrow searches start at midnight unless a time is given.
          when: tomorrow
            ? shiftDays(withDepartureOverride({ ...moroccoNow(), minutes: 0 }, at), 1)
            : withDepartureOverride(moroccoNow(), at),
        },
        snapshot,
        strategy,
      ).slice(0, 4)
    : [];

  const action = getPathname({ locale, href: "/plan" });
  const selectClass =
    "h-12 w-full appearance-none rounded-xl border border-line bg-card px-3 text-sm font-medium text-ink outline-none focus:border-zellige";

  const strategies: IntercityStrategy[] = ["fastest", "cheapest", "balanced"];

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
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { name: "from", labelKey: "from", value: origin?.id },
              { name: "to", labelKey: "to", value: destination?.id },
            ] as const
          ).map((field) => (
            <label key={field.name} className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
                {tCommon(field.labelKey)}
              </span>
              <select
                name={field.name}
                required
                defaultValue={field.value ?? ""}
                className={selectClass}
              >
                <option value="" disabled>
                  —
                </option>
                {CITY_ORDER.map((city) => {
                  const stops = stationsByCity.get(city) ?? [];
                  if (stops.length === 0) return null;
                  return (
                    <optgroup key={city} label={tCity(city)}>
                      {stops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {pickLocale(s.name, locale)}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </label>
          ))}
        </div>

        <fieldset className="mt-4">
          <legend className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
            {t("strategy")}
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {strategies.map((s) => (
              <label
                key={s}
                className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-plaster text-sm font-semibold text-ink-muted transition-colors has-[:checked]:border-zellige has-[:checked]:bg-zellige has-[:checked]:text-white"
              >
                <input
                  type="radio"
                  name="strategy"
                  value={s}
                  defaultChecked={strategy === s}
                  className="sr-only"
                />
                {t(s)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
            {t("date")}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "today", labelKey: "dayToday" },
                { value: "tomorrow", labelKey: "dayTomorrow" },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-plaster text-sm font-semibold text-ink-muted transition-colors has-[:checked]:border-zellige has-[:checked]:bg-zellige has-[:checked]:text-white"
              >
                <input
                  type="radio"
                  name="day"
                  value={option.value}
                  defaultChecked={tomorrow === (option.value === "tomorrow")}
                  className="sr-only"
                />
                {t(option.labelKey)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
              {t("departAfter")}
            </span>
            <input type="time" name="at" defaultValue={at ?? ""} className={selectClass} />
          </label>
          <Button type="submit" variant="primary" size="lg">
            <TrainFront className="h-4 w-4" aria-hidden />
            {t("findRoutes")}
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
              trackEvent="plan_search"
            />
          ) : (
            <div className="rounded-2xl border border-line bg-card p-6 text-center text-sm leading-6 text-ink-muted">
              {t("noRoutes")}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
