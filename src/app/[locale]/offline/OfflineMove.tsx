"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Navigation, WifiOff } from "lucide-react";
import { rankNextMoves } from "@/core/engine/rank";
import type { BudgetPref, NextMove } from "@/core/types";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import { usePacks } from "@/lib/packs";
import { moroccoNow } from "@/lib/time-context";
import { Button } from "@/ui/Button";
import { NextMoveCard } from "@/ui/NextMoveCard";
import { CityPinMap } from "./CityPinMap";

const SELECT_CLASS =
  "h-12 w-full appearance-none rounded-xl border border-line bg-card px-3 text-sm font-medium text-ink outline-none focus:border-zellige";

export function OfflineMove() {
  const t = useTranslations();
  const locale = useLocale();
  const format = useFormatter();
  const packs = usePacks();
  const searchParams = useSearchParams();

  const pack = packs[0];
  // Saved offline moves deep-link back here with ?from&to prefilled.
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [budget, setBudget] = useState<BudgetPref>("mid");
  const [moves, setMoves] = useState<NextMove[] | null>(null);

  const places = useMemo(
    () => pack?.snapshot.places ?? [],
    [pack],
  );

  if (!pack) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <WifiOff className="mx-auto h-8 w-8 text-ink-faint" aria-hidden />
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-muted">
          {t("offline.noPack")}
        </p>
        <Link
          href="/packs"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-terracotta px-5 text-sm font-semibold text-white"
        >
          {t("offline.goToPacks")}
        </Link>
      </div>
    );
  }

  function compute() {
    const origin = places.find((p) => p.id === from);
    const destination = places.find((p) => p.id === to);
    if (!origin || !destination || origin.id === destination.id) return;
    // The pure engine runs right here in the browser, on pack data.
    setMoves(
      rankNextMoves(
        {
          origin: { point: origin.point, placeId: origin.id },
          destination: { point: destination.point, placeId: destination.id },
          when: moroccoNow(),
          connectivity: "offline",
          prefs: { budget },
        },
        pack.snapshot,
      ),
    );
  }

  return (
    <div className="grid gap-6">
      <p className="text-[13px] text-ink-faint">
        {t("offline.usingPack", {
          city: t(`cityNames.${pack.city}`),
          date: format.dateTime(new Date(pack.downloadedAt), {
            dateStyle: "medium",
          }),
        })}
      </p>

      <div className="rounded-2xl border border-line bg-card p-4 sm:p-5">
        <div className="grid gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
              {t("move.whereAreYou")}
            </span>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="" disabled>
                {t("move.pickPlace")}
              </option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {pickLocale(p.name, locale)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
              {t("move.whereTo")}
            </span>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="" disabled>
                {t("move.pickPlace")}
              </option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {pickLocale(p.name, locale)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
              {t("move.budget")}
            </span>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value as BudgetPref)}
              className={SELECT_CLASS}
            >
              <option value="lean">{t("move.budgetLean")}</option>
              <option value="mid">{t("move.budgetMid")}</option>
              <option value="premium">{t("move.budgetPremium")}</option>
            </select>
          </label>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={compute}
            disabled={!from || !to || from === to}
          >
            <Navigation className="h-4 w-4" aria-hidden />
            {t("move.findMove")}
          </Button>
        </div>
      </div>

      {moves && (
        <section aria-live="polite">
          {moves.length > 0 ? (
            <div className="grid gap-4">
              {moves.map((move, i) => (
                <NextMoveCard key={move.id} move={move} isBest={i === 0} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-card p-6 text-center text-sm leading-6 text-ink-muted">
              {t("card.noMoves")}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-base font-bold text-ink">{t("offline.mapTitle")}</h2>
        <CityPinMap snapshot={pack.snapshot} />
      </section>
    </div>
  );
}
