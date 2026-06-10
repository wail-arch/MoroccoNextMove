import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CITY_GUIDES } from "@/data/cities-content";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import { MoroccoMap } from "@/ui/MoroccoMap";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cities" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function CitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cities");
  const tLanding = await getTranslations("landing");
  const tCityNames = await getTranslations("cityNames");

  const mapLabels = {
    marrakech: tCityNames("marrakech"),
    casablanca: tCityNames("casablanca"),
    rabat: tCityNames("rabat").split(" ")[0],
    tangier: tCityNames("tangier"),
    fes: tCityNames("fes").split(" ")[0],
  };

  return (
    <main id="content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-zellige-strong sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-7 text-ink-muted">
          {t("subtitle")}
        </p>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
        <figure>
          <MoroccoMap labels={mapLabels} className="mx-auto max-w-md lg:max-w-none" />
          <figcaption className="mt-2 text-center text-[12px] text-ink-faint">
            {tLanding("mapCaption")}
          </figcaption>
        </figure>

        <div className="grid gap-4">
          {CITY_GUIDES.map((city) => (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}`}
              className="group rounded-2xl border border-line bg-card p-5 transition-colors hover:border-zellige"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-ink group-hover:text-zellige">
                  {pickLocale(city.name, locale)}
                </h2>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-ink-faint rtl:rotate-180"
                  aria-hidden
                />
              </div>
              <p className="mt-1 text-sm font-medium text-terracotta">
                {pickLocale(city.tagline, locale)}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {pickLocale(city.intro, locale)}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-zellige">
                {t("viewGuide")}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
              </span>
            </Link>
          ))}
          <p className="text-[13px] text-ink-faint">
            {t("comingSoon")}: {tCityNames("tangier")} · {tCityNames("fes")}
          </p>
        </div>
      </div>
    </main>
  );
}
