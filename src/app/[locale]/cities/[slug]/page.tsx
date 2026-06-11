import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, WifiOff } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBaseSnapshot } from "@/data";
import { CITY_GUIDES, getCityGuide } from "@/data/cities-content";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { pickLocale } from "@/lib/locale";
import { moroccoNow } from "@/lib/time-context";
import { AdvisoryStrip } from "@/ui/AdvisoryStrip";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CITY_GUIDES.map((city) => ({ locale, slug: city.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const city = getCityGuide(slug);
  if (!city) return {};
  return {
    title: pickLocale(city.name, locale),
    description: pickLocale(city.tagline, locale),
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const city = getCityGuide(slug);
  if (!city) notFound();

  const t = await getTranslations("cities");
  const tLanding = await getTranslations("landing");
  const snapshot = getBaseSnapshot();

  // Surface the city's trust-layer content: advisories scoped to this city
  // or to its places.
  const cityPlaceIds = new Set(
    snapshot.places.filter((p) => p.city === city.cityId).map((p) => p.id),
  );
  const { todayIso } = moroccoNow();
  const advisories = snapshot.advisories.filter((a) => {
    // Dated notices only inside their window.
    if (
      a.activeBetween &&
      (todayIso < a.activeBetween.fromIso || todayIso > a.activeBetween.toIso)
    ) {
      return false;
    }
    if (a.appliesTo.cities?.includes(city.cityId)) return true;
    if (a.appliesTo.placeIds?.some((id) => cityPlaceIds.has(id))) return true;
    return false;
  });

  return (
    <main id="content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <Link
        href="/cities"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zellige hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
        {t("backToCities")}
      </Link>

      <header className="mt-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-zellige-strong sm:text-4xl">
          {pickLocale(city.name, locale)}
        </h1>
        <p className="mt-1 text-base font-medium text-terracotta">
          {pickLocale(city.tagline, locale)}
        </p>
        <p className="mt-4 text-[15px] leading-7 text-ink-muted">
          {pickLocale(city.intro, locale)}
        </p>
      </header>

      {/* Quick answers — prefilled /move queries */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink">{t("quickMoves")}</h2>
        <div className="mt-3 grid gap-3">
          {city.movePresets.map((preset) => (
            <Link
              key={`${preset.from}-${preset.to}`}
              href={`/move?from=${preset.from}&to=${preset.to}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4 transition-colors hover:border-zellige"
            >
              <span className="text-sm font-semibold text-ink group-hover:text-zellige">
                {pickLocale(preset.label, locale)}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-terracotta">
                {t("openInMove")}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* The trust layer for this city */}
      {advisories.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink">{t("watchOut")}</h2>
          <div className="mt-3 grid gap-3">
            {advisories.map((advisory) => (
              <AdvisoryStrip key={advisory.id} advisory={advisory} />
            ))}
          </div>
        </section>
      )}

      {/* Offline pack CTA for pack cities */}
      {city.hasOfflinePack && (
        <section className="mt-8 overflow-hidden rounded-3xl bg-zellige-strong">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                <WifiOff className="h-4 w-4" aria-hidden />
                {tLanding("packTitle")}
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
                {tLanding("packBody")}
              </p>
            </div>
            <Link
              href="/packs"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-terracotta px-4 text-sm font-semibold text-white transition-colors hover:bg-terracotta-strong"
            >
              {tLanding("packCta")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
