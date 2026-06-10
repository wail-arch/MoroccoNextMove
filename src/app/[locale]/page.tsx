import { ArrowRight, MapPinned, Navigation, Route, ShieldCheck, WifiOff } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CITY_GUIDES } from "@/data/cities-content";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import { MoroccoMap } from "@/ui/MoroccoMap";
import { StarMark } from "@/ui/Logo";
import { TierLegend } from "@/ui/TierLegend";

const PRIMARY_CTA =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-terracotta px-5 text-base font-semibold text-white transition-colors hover:bg-terracotta-strong";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tApp = await getTranslations("app");
  const tCities = await getTranslations("cities");
  const tCityNames = await getTranslations("cityNames");

  const mapLabels = {
    marrakech: tCityNames("marrakech"),
    casablanca: tCityNames("casablanca"),
    rabat: tCityNames("rabat").split(" ")[0],
    tangier: tCityNames("tangier"),
    fes: tCityNames("fes").split(" ")[0],
  };

  const steps = [
    { icon: MapPinned, title: t("how1Title"), body: t("how1Body") },
    { icon: ShieldCheck, title: t("how2Title"), body: t("how2Body") },
    { icon: Route, title: t("how3Title"), body: t("how3Body") },
  ];

  return (
    <main id="content" className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-zellige">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-saffron">
            <StarMark className="h-4 w-4" />
            {t("heroKicker")}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
            {tApp("tagline")}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/85 sm:text-base sm:leading-8">
            {t("heroSub")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/move" className={PRIMARY_CTA}>
              <Navigation className="h-4 w-4" aria-hidden />
              {t("ctaArrive")}
            </Link>
            <Link
              href="/plan"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("ctaPlan")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-zellige-strong sm:text-3xl">
          {t("howTitle")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="rounded-2xl border border-line bg-card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zellige-soft text-zellige">
                <step.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Honesty / confidence tiers */}
      <section className="bg-sand/60">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-zellige-strong sm:text-3xl">
            {t("honestyTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-ink-muted">
            {t("honestySub")}
          </p>
          <TierLegend className="mt-6" />
        </div>
      </section>

      {/* Coverage map + city cards */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-zellige-strong sm:text-3xl">
          {t("coverageTitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-ink-muted">
          {t("coverageSub")}
        </p>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
          <figure>
            <MoroccoMap labels={mapLabels} className="mx-auto max-w-md lg:max-w-none" />
            <figcaption className="mt-2 text-center text-[12px] text-ink-faint">
              {t("mapCaption")}
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
                  <h3 className="font-display text-xl font-semibold text-ink group-hover:text-zellige">
                    {pickLocale(city.name, locale)}
                  </h3>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                    aria-hidden
                  />
                </div>
                <p className="mt-1 text-sm font-medium text-terracotta">
                  {pickLocale(city.tagline, locale)}
                </p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-muted">
                  {pickLocale(city.intro, locale)}
                </p>
              </Link>
            ))}
            <p className="text-[13px] text-ink-faint">
              {tCities("comingSoon")}: {tCityNames("tangier")} · {tCityNames("fes")}
            </p>
          </div>
        </div>
      </section>

      {/* Offline pack CTA */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-zellige-strong">
          <div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                <WifiOff className="h-4 w-4" aria-hidden />
                {t("packTitle")}
              </p>
              <p className="mt-3 text-[15px] leading-7 text-white/85">{t("packBody")}</p>
            </div>
            <Link href="/packs" className={`${PRIMARY_CTA} shrink-0`}>
              {t("packCta")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
