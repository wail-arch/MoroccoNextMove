import { useFormatter, useTranslations } from "next-intl";
import { CircleCheck, History, TriangleAlert } from "lucide-react";
import type { ConfidenceTier } from "@/core/types";
import { cn } from "@/lib/cn";

const TIER_STYLES: Record<ConfidenceTier, { badge: string; icon: typeof CircleCheck }> = {
  "official-live": { badge: "bg-tier-live-soft text-tier-live", icon: CircleCheck },
  "cached-verified": { badge: "bg-tier-cached-soft text-tier-cached", icon: History },
  "estimated-flagged": {
    badge: "bg-tier-estimated-soft text-tier-estimated",
    icon: TriangleAlert,
  },
};

const TIER_KEYS: Record<ConfidenceTier, string> = {
  "official-live": "officialLive",
  "cached-verified": "cachedVerified",
  "estimated-flagged": "estimatedFlagged",
};

export function ConfidenceBadge({
  tier,
  lastVerifiedAt,
  className,
}: {
  tier: ConfidenceTier;
  lastVerifiedAt?: string;
  className?: string;
}) {
  const t = useTranslations("confidence");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const { badge, icon: Icon } = TIER_STYLES[tier];

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
          badge,
        )}
      >
        <Icon className="h-3 w-3" aria-hidden />
        {t(TIER_KEYS[tier])}
      </span>
      {lastVerifiedAt && (
        <span className="text-[11px] text-ink-faint">
          {tCommon("lastVerified", {
            date: format.dateTime(new Date(lastVerifiedAt), { dateStyle: "medium" }),
          })}
        </span>
      )}
    </span>
  );
}
