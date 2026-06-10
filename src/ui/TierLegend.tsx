import { useTranslations } from "next-intl";
import { CircleCheck, History, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const TIERS = [
  {
    labelKey: "officialLive",
    bodyKey: "legendLive",
    icon: CircleCheck,
    color: "text-tier-live",
    bg: "bg-tier-live-soft",
  },
  {
    labelKey: "cachedVerified",
    bodyKey: "legendCached",
    icon: History,
    color: "text-tier-cached",
    bg: "bg-tier-cached-soft",
  },
  {
    labelKey: "estimatedFlagged",
    bodyKey: "legendEstimated",
    icon: TriangleAlert,
    color: "text-tier-estimated",
    bg: "bg-tier-estimated-soft",
  },
] as const;

export function TierLegend({ className }: { className?: string }) {
  const t = useTranslations("confidence");

  return (
    <section className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {TIERS.map(({ labelKey, bodyKey, icon: Icon, color, bg }) => (
        <div key={labelKey} className="rounded-2xl border border-line bg-card p-4">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
              bg,
              color,
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {t(labelKey)}
          </span>
          <p className="mt-3 text-sm leading-6 text-ink-muted">{t(bodyKey)}</p>
        </div>
      ))}
    </section>
  );
}
