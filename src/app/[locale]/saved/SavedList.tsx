"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ArrowRight, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { clearMoves, removeMove, useSavedMoves, type SavedMove } from "@/lib/saved";
import { Button } from "@/ui/Button";
import { NextMoveCard } from "@/ui/NextMoveCard";

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
// Captured once at module load — staleness is a day-granularity hint, and
// render must stay pure.
const LOADED_AT = Date.now();

function recheckHref(query: NonNullable<SavedMove["query"]>): string {
  const params = new URLSearchParams();
  if (query.fromId) params.set("from", query.fromId);
  if (query.toId) params.set("to", query.toId);
  if (query.budget) params.set("budget", query.budget);
  if (query.strategy) params.set("strategy", query.strategy);
  return `/${query.source}?${params.toString()}`;
}

export function SavedList() {
  const t = useTranslations("saved");
  const format = useFormatter();
  const saved = useSavedMoves();

  if (saved.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center text-sm leading-7 text-ink-muted">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => clearMoves()}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {t("clearAll")}
        </Button>
      </div>

      {saved.map((entry) => {
        const isStale =
          LOADED_AT - Date.parse(entry.savedAt) > STALE_AFTER_MS &&
          entry.move.legs.some((l) => l.departAt);
        return (
          <section key={entry.id}>
            <p className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-ink">
              {entry.fromLabel}
              <ArrowRight className="h-3.5 w-3.5 text-ink-faint rtl:rotate-180" aria-hidden />
              {entry.toLabel}
              <span className="text-[12px] font-normal text-ink-faint">
                ·{" "}
                {t("savedAt", {
                  date: format.dateTime(new Date(entry.savedAt), {
                    dateStyle: "medium",
                  }),
                })}
              </span>
              {entry.query?.fromId && entry.query?.toId && (
                <Link
                  href={recheckHref(entry.query)}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-zellige hover:underline"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden />
                  {t("recheck")}
                </Link>
              )}
            </p>
            {isStale && (
              <p className="mb-2 flex items-center gap-1.5 text-[12px] text-tier-cached">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {t("mayBeStale")}
              </p>
            )}
            <NextMoveCard
              move={entry.move}
              isBest={false}
              saved
              onToggleSave={() => removeMove(entry.id)}
            />
          </section>
        );
      })}
    </div>
  );
}
