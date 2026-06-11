import { useLocale } from "next-intl";
import { Info, Megaphone, ShieldAlert, TriangleAlert } from "lucide-react";
import type { AdvisoryNote, AdvisorySeverity } from "@/core/types";
import { cn } from "@/lib/cn";
import { pickLocale } from "@/lib/locale";

const SEVERITY_STYLES: Record<
  AdvisorySeverity,
  { box: string; icon: typeof Info; iconColor: string }
> = {
  info: {
    box: "border-zellige/20 bg-zellige-soft",
    icon: Info,
    iconColor: "text-zellige",
  },
  caution: {
    box: "border-saffron/40 bg-saffron-soft",
    icon: TriangleAlert,
    iconColor: "text-tier-cached",
  },
  warning: {
    box: "border-terracotta/30 bg-terracotta-soft",
    icon: ShieldAlert,
    iconColor: "text-terracotta",
  },
};

export function AdvisoryStrip({
  advisory,
  className,
}: {
  advisory: AdvisoryNote;
  className?: string;
}) {
  const locale = useLocale();
  const styles = SEVERITY_STYLES[advisory.severity];
  const isDisruption = advisory.kind === "disruption";
  // Dated service notices shout louder than evergreen advice.
  const Icon = isDisruption ? Megaphone : styles.icon;
  const box = isDisruption ? "border-terracotta/50 bg-terracotta-soft" : styles.box;
  const iconColor = isDisruption ? "text-terracotta" : styles.iconColor;

  return (
    <div
      className={cn("flex gap-2.5 rounded-xl border p-3", box, className)}
      role={
        advisory.severity === "warning" || isDisruption ? "alert" : "note"
      }
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} aria-hidden />
      <div className="min-w-0 text-sm leading-5">
        <p className="font-semibold text-ink">{pickLocale(advisory.title, locale)}</p>
        <p className="mt-0.5 text-[13px] leading-5 text-ink-muted">
          {pickLocale(advisory.body, locale)}
        </p>
      </div>
    </div>
  );
}
