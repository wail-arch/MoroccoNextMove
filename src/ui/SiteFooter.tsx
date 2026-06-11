import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";

export function SiteFooter() {
  const t = useTranslations("nav");

  return (
    <footer className="mt-auto border-t border-line bg-sand/60">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo />
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-ink-muted">
          <Link href="/move" className="hover:text-ink">
            {t("move")}
          </Link>
          <Link href="/plan" className="hover:text-ink">
            {t("plan")}
          </Link>
          <Link href="/cities" className="hover:text-ink">
            {t("cities")}
          </Link>
          <Link href="/about/sources" className="hover:text-ink">
            {t("sources")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-line/60">
        <p className="mx-auto w-full max-w-5xl px-4 py-3 text-[11px] leading-5 text-ink-faint sm:px-6">
          © OpenStreetMap contributors (ODbL) · Rail Maroc Community GTFS (ODbL) ·
          Morocco Next Move
        </p>
      </div>
    </footer>
  );
}
