"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { track } from "@/lib/track";
import { cn } from "@/lib/cn";

const LABELS: Record<string, string> = {
  en: "EN",
  fr: "FR",
  ar: "عربية",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("a11y");

  function switchTo(nextLocale: string) {
    if (nextLocale === locale) return;
    const query = searchParams.toString();
    track("locale_switched", { to: nextLocale });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      locale: nextLocale,
    });
  }

  return (
    <div
      role="group"
      aria-label={t("languageSwitcher")}
      className="flex items-center rounded-full border border-line bg-card p-0.5"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "min-w-10 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors",
            l === locale
              ? "bg-zellige text-white"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
