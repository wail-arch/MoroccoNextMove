"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
} from "lucide-react";
import type { NextMove } from "@/core/types";
import { cn } from "@/lib/cn";
import { formatFare } from "@/lib/format";
import { pickLocale } from "@/lib/locale";
import { track } from "@/lib/track";
import { AdvisoryStrip } from "./AdvisoryStrip";
import { Button, ButtonLink } from "./Button";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ModeIcon } from "./ModeIcon";
import { PaymentChips } from "./PaymentChips";

function Duration({ minutes }: { minutes: number }) {
  const t = useTranslations("common");
  if (minutes < 60) return <>{t("minutes", { count: minutes })}</>;
  return (
    <>{t("durationHM", { hours: Math.floor(minutes / 60), minutes: minutes % 60 })}</>
  );
}

export function NextMoveCard({
  move,
  isBest,
  saved = false,
  onToggleSave,
}: {
  move: NextMove;
  isBest: boolean;
  saved?: boolean;
  onToggleSave?: (move: NextMove) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [showSteps, setShowSteps] = useState(false);
  const arrow = locale === "ar" ? "←" : "→";

  const fare = formatFare(move.totalFare, locale);
  const scheduledLeg = move.legs.find((l) => l.departAt);
  const walkingNoteLeg = move.legs.find((l) => l.walkingNote);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-card",
        isBest
          ? "border-zellige shadow-[0_14px_40px_rgba(14,90,78,0.14)]"
          : "border-line shadow-sm",
      )}
    >
      {isBest && (
        <p className="bg-zellige px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-saffron">
          {t("card.bestNextMove")}
        </p>
      )}

      <div className="flex flex-col gap-3 p-4">
        {/* Headline row */}
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              isBest ? "bg-zellige text-white" : "bg-zellige-soft text-zellige",
            )}
          >
            <ModeIcon mode={move.headlineMode} className="h-5.5 w-5.5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold leading-tight text-ink">
              {t(`modes.${move.headlineMode}`)}
              {move.legs.find((l) => l.lineName) && (
                <span className="font-medium text-ink-muted">
                  {" · "}
                  {pickLocale(
                    move.legs.find((l) => l.lineName)!.lineName!,
                    locale,
                  )}
                </span>
              )}
            </h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-ink-muted">
              <span className="font-semibold text-ink">
                <Duration minutes={move.totalDurationMinutes} />
              </span>
              <span aria-hidden>·</span>
              <span>{t("common.transfers", { count: move.transfers })}</span>
              {scheduledLeg?.departAt && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-medium text-zellige">
                    {t("card.departs", { time: scheduledLeg.departAt })}
                  </span>
                </>
              )}
            </p>
          </div>
          {fare && (
            <p className="shrink-0 text-end">
              {/* Fare ranges are LTR ("60–120") even inside RTL text. */}
              <span dir="ltr" className="block text-base font-bold text-ink">
                {fare}
              </span>
            </p>
          )}
        </div>

        {/* Confidence */}
        <ConfidenceBadge tier={move.tier} lastVerifiedAt={move.lastVerifiedAt} />

        {/* Reasons */}
        {move.reasons.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {move.reasons.map((reason) => (
              <li
                key={reason}
                className="rounded-full border border-zellige/25 bg-zellige-soft px-2 py-0.5 text-[11px] font-semibold text-zellige"
              >
                {t(`reasons.${reason}`)}
              </li>
            ))}
          </ul>
        )}

        <PaymentChips modes={move.paymentModes} />

        {/* The trust layer, in context */}
        {move.advisories.map((advisory) => (
          <AdvisoryStrip key={advisory.id} advisory={advisory} />
        ))}

        {/* Final-approach landmark note */}
        {walkingNoteLeg?.walkingNote && (
          <div className="flex gap-2.5 rounded-xl border border-zellige/20 bg-plaster p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" aria-hidden />
            <div className="text-sm">
              <p className="font-semibold text-ink">{t("card.finalApproach")}</p>
              <p className="mt-0.5 text-[13px] leading-5 text-ink-muted">
                {pickLocale(walkingNoteLeg.walkingNote, locale)}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {move.deepLink && (
            <ButtonLink
              href={move.deepLink.url}
              target="_blank"
              rel="noopener noreferrer"
              variant={isBest ? "primary" : "outline"}
              size="md"
              className="flex-1 sm:flex-none"
              onClick={() => track("move_deeplink_click", { move: move.id })}
            >
              {t(move.deepLink.labelKey)}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </ButtonLink>
          )}
          {onToggleSave && (
            <Button
              variant="outline"
              size="md"
              onClick={() => onToggleSave(move)}
              aria-pressed={saved}
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4 text-zellige" aria-hidden />
              ) : (
                <Bookmark className="h-4 w-4" aria-hidden />
              )}
              {saved ? t("card.savedMove") : t("card.saveMove")}
            </Button>
          )}
          {move.legs.length > 1 && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setShowSteps((v) => !v);
                if (!showSteps) track("move_tap_through", { move: move.id });
              }}
              aria-expanded={showSteps}
            >
              {showSteps ? t("card.hideDetails") : t("card.details")}
              {showSteps ? (
                <ChevronUp className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden />
              )}
            </Button>
          )}
        </div>

        {/* Step-by-step legs */}
        {showSteps && (
          <ol className="mt-1 space-y-0 border-s-2 border-zellige-soft ps-4">
            {move.legs.map((leg, i) => (
              <li key={i} className="relative pb-4 last:pb-0">
                <span className="absolute -start-[25px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zellige-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-zellige" />
                </span>
                <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                    <ModeIcon mode={leg.mode} className="h-3.5 w-3.5 text-zellige" />
                    {t(`modes.${leg.mode}`)}
                  </span>
                  {leg.departAt && (
                    <span className="text-[13px] font-medium text-zellige">
                      {leg.departAt}
                      {leg.arriveAt ? ` ${arrow} ${leg.arriveAt}` : ""}
                    </span>
                  )}
                  <span className="text-[13px] text-ink-muted">
                    <Duration minutes={leg.durationMinutes} />
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  {pickLocale(leg.from.name, locale)} {arrow}{" "}
                  {pickLocale(leg.to.name, locale)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}
