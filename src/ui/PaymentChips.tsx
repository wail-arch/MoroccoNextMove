import { useTranslations } from "next-intl";
import { Banknote, CreditCard, Smartphone, Ticket } from "lucide-react";
import type { PaymentMode } from "@/core/types";

const ICONS: Record<PaymentMode, typeof Banknote> = {
  card: CreditCard,
  cash: Banknote,
  "cash-small-bills": Banknote,
  onboard: Ticket,
  counter: Ticket,
  app: Smartphone,
};

export function PaymentChips({ modes }: { modes: PaymentMode[] }) {
  const t = useTranslations("payments");
  if (modes.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {modes.map((mode) => {
        const Icon = ICONS[mode];
        return (
          <li
            key={mode}
            className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-ink"
          >
            <Icon className="h-3 w-3 text-ink-muted" aria-hidden />
            {t(mode)}
          </li>
        );
      })}
    </ul>
  );
}
