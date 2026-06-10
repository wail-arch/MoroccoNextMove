"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ArrowRight, Trash2 } from "lucide-react";
import { clearMoves, removeMove, useSavedMoves } from "@/lib/saved";
import { Button } from "@/ui/Button";
import { NextMoveCard } from "@/ui/NextMoveCard";

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

      {saved.map((entry) => (
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
          </p>
          <NextMoveCard
            move={entry.move}
            isBest={false}
            saved
            onToggleSave={() => removeMove(entry.id)}
          />
        </section>
      ))}
    </div>
  );
}
