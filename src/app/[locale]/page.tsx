import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  CircleCheck,
  Clock,
  Coins,
  Footprints,
  History,
  MapPinned,
  Navigation,
  Route,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { rankNextMoves } from "@/core";
import { getBaseSnapshot } from "@/data";
import { CITY_GUIDES } from "@/data/cities-content";
import { Link } from "@/i18n/navigation";
import { formatFare } from "@/lib/format";
import { pickLocale } from "@/lib/locale";
import { moroccoNow } from "@/lib/time-context";
import { ConfidenceBadge } from "@/ui/ConfidenceBadge";
import { HeroIntro } from "@/ui/landing/HeroIntro";
import { Marquee } from "@/ui/landing/Marquee";
import { StarMark } from "@/ui/Logo";
import { ModeIcon } from "@/ui/ModeIcon";
import { LandingMotion } from "@/ui/motion/LandingMotion";
import { MoroccoMap } from "@/ui/MoroccoMap";
import { TierLegend } from "@/ui/TierLegend";

import heroImg from "../../../public/images/hero.jpg";
import cityCasablancaImg from "../../../public/images/city-casablanca.jpg";
import cityMarrakechImg from "../../../public/images/city-marrakech.jpg";
import cityRabatImg from "../../../public/images/city-rabat.jpg";
import nightTaxiImg from "../../../public/images/night-taxi.jpg";
import packImg from "../../../public/images/pack-marrakech.jpg";
import railImg from "../../../public/images/rail-alboraq.jpg";

const CITY_IMAGES = {
  "city-marrakech": cityMarrakechImg,
  "city-casablanca": cityCasablancaImg,
  "city-rabat": cityRabatImg,
} as const;

const KICKER =
  "flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]";
const PRIMARY_CTA =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-terracotta px-6 text-base font-semibold text-white transition-colors hover:bg-terracotta-strong";

const HERO_TIER_CHIPS = [
  { icon: CircleCheck, dot: "bg-tier-live", key: "officialLive" },
  { icon: History, dot: "bg-tier-cached", key: "cachedVerified" },
  { icon: TriangleAlert, dot: "bg-tier-estimated", key: "estimatedFlagged" },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tApp = await getTranslations("app");
  const tCard = await getTranslations("card");
  const tCities = await getTranslations("cities");
  const tCityNames = await getTranslations("cityNames");
  const tCommon = await getTranslations("common");
  const tConfidence = await getTranslations("confidence");
  const tModes = await getTranslations("modes");

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

  // A real query through the real engine: Marrakech airport → Jemaa el-Fnaa,
  // pinned to a Friday mid-morning so the showcased ranking is deterministic.
  const snapshot = getBaseSnapshot();
  const demoFrom = snapshot.places.find((p) => p.id === "rak-airport");
  const demoTo = snapshot.places.find((p) => p.id === "jemaa-el-fnaa");
  const demoMoves =
    demoFrom && demoTo
      ? rankNextMoves(
          {
            origin: { point: demoFrom.point, placeId: demoFrom.id },
            destination: { point: demoTo.point, placeId: demoTo.id },
            when: { ...moroccoNow(), dayOfWeek: 4, minutes: 635 },
            connectivity: "online",
            prefs: { budget: "mid" },
          },
          snapshot,
        ).slice(0, 3)
      : [];

  const marqueeItems = [
    t("marqueeFares"),
    t("marqueeOffline"),
    t("marqueePins"),
    t("marqueeModes"),
    t("marqueeLang"),
  ];

  const stats = [
    { value: 320, label: t("statSpeed") },
    { value: 3, label: t("statCities") },
    { value: 0, label: t("statBars") },
  ];

  const factors = [
    { icon: Clock, label: t("factorTime") },
    { icon: Coins, label: t("factorFare") },
    { icon: ShieldCheck, label: t("factorTrust") },
    { icon: Footprints, label: t("factorEffort") },
  ];

  return (
    <main id="content" className="flex-1 overflow-x-clip">
      <span
        aria-hidden
        data-progress
        className="fixed inset-x-0 top-0 z-50 block h-[3px] origin-left scale-x-0 bg-terracotta rtl:origin-right"
      />

      {/* Hero */}
      <section data-hero className="relative flex min-h-[92svh] items-end overflow-hidden bg-zellige-strong">
        <div data-hero-media className="absolute inset-0">
          <Image
            data-hero-image
            src={heroImg}
            alt={t("heroImageAlt")}
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--ink)_85%,transparent)_0%,color-mix(in_srgb,var(--ink)_25%,transparent)_45%,transparent_72%)]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--ink)_40%,transparent),transparent)]"
          />
        </div>

        {/* Verified pin beside the Koutoubia. Anchored to the photograph, so
            physical (not logical) coordinates are correct in RTL too; hidden
            on small screens where the object-cover crop shifts the landmark. */}
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-full sm:block"
          style={{ left: "39.5%", top: "50%" }}
        >
          {/* GSAP animates the inner element: it clears Tailwind's native
              translate property, so the anchoring stays on the wrapper. */}
          <span data-hero-pin className="flex flex-col items-center">
            <span
              data-hero-pin-chip
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-ink shadow-lg"
            >
              <CircleCheck className="h-3 w-3 text-tier-live" aria-hidden />
              {tConfidence("officialLive")}
            </span>
            <span className="mt-1 block h-3 w-px bg-white/80" />
            <span
              data-hero-pin-dot
              className="block h-2.5 w-2.5 rounded-full bg-tier-live ring-2 ring-white"
            />
          </span>
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-32 sm:px-6 sm:pb-24">
          <p data-fade className={`${KICKER} text-saffron`}>
            <StarMark className="h-4 w-4" />
            {t("heroKicker")}
          </p>
          <h1
            data-split
            className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-7xl"
          >
            {tApp("tagline")}
          </h1>
          <p
            data-fade
            className="mt-6 max-w-xl text-[15px] leading-7 text-white/85 sm:text-base sm:leading-8"
          >
            {t("heroSub")}
          </p>
          <div data-fade className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/move" data-magnetic className={PRIMARY_CTA}>
              <Navigation className="h-4 w-4" aria-hidden />
              {t("ctaArrive")}
            </Link>
            <Link
              href="/plan"
              data-magnetic
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              {t("ctaPlan")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
          <div data-fade className="mt-10 flex flex-wrap items-center gap-2">
            {HERO_TIER_CHIPS.map(({ icon: Icon, dot, key }) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {tConfidence(key)}
              </span>
            ))}
            <span className="basis-full text-[12px] text-white/60 sm:basis-auto sm:ps-2">
              {t("heroTrust")}
            </span>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center sm:flex">
          <div data-fade className="flex flex-col items-center gap-1.5 text-white/70">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
              {t("scrollCue")}
            </span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </div>
        </div>

        <HeroIntro />
      </section>

      <Marquee items={marqueeItems} />

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p data-reveal className={`${KICKER} text-terracotta`}>
          {t("howKicker")}
        </p>
        <h2
          data-reveal
          className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-zellige-strong sm:text-5xl"
        >
          {t("howTitle")}
        </h2>
        <div data-reveal-group className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              data-reveal
              className="group relative overflow-hidden rounded-3xl border border-line bg-card p-6 transition-shadow duration-300 hover:shadow-xl"
            >
              <span
                aria-hidden
                className="block select-none font-display text-6xl font-semibold leading-none text-sand"
              >
                0{i + 1}
              </span>
              <span className="absolute end-6 top-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-zellige-soft text-zellige transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                <step.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-6 text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live engine demo */}
      <section className="grain relative overflow-hidden bg-zellige-strong">
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p data-reveal className={`${KICKER} text-saffron`}>
              {t("demoKicker")}
            </p>
            <h2
              data-reveal
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl"
            >
              {t("demoTitle")}
            </h2>
            <p data-reveal className="mt-4 max-w-xl text-[15px] leading-7 text-white/80">
              {t("demoSub")}
            </p>

            <div data-reveal className="mt-7 flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">
                {t("demoRankedBy")}
              </span>
              {factors.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  data-factor
                  className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-white/80 ring-1 ring-white/10"
                >
                  <Icon className="h-3 w-3" aria-hidden />
                  {label}
                </span>
              ))}
            </div>

            {demoFrom && demoTo && (
              <p
                data-demo-route
                className="mt-6 flex items-center gap-2 text-sm font-semibold text-white/70"
              >
                {pickLocale(demoFrom.name, locale)}
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-saffron rtl:rotate-180" aria-hidden />
                {pickLocale(demoTo.name, locale)}
              </p>
            )}

            <div data-demo className="mt-4 grid gap-3">
              {demoMoves.map((move, i) => (
                <div
                  key={move.id}
                  data-demo-row
                  data-rank={i}
                  className="relative rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur-sm"
                >
                  {i === 0 && (
                    <span
                      data-demo-best
                      className="absolute -top-2.5 start-4 rounded-full bg-saffron px-2.5 py-0.5 text-[11px] font-bold text-ink"
                    >
                      {tCard("bestNextMove")}
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <ModeIcon mode={move.headlineMode} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">
                        {tModes(move.headlineMode)} ·{" "}
                        {tCommon("transfers", { count: move.transfers })}
                      </p>
                      <ConfidenceBadge tier={move.tier} className="mt-1" />
                    </div>
                    <div className="shrink-0 text-end">
                      <p
                        className="text-sm font-bold text-white"
                        data-demo-minutes={move.totalDurationMinutes}
                      >
                        {tCommon("minutes", { count: move.totalDurationMinutes })}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-saffron">
                        {formatFare(move.totalFare, locale) || tCommon("free")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p data-reveal className="mt-4 text-[12px] text-white/50">
              {tCard("fareNote")}
            </p>
          </div>

          <div
            data-tilt
            className="relative hidden overflow-hidden rounded-3xl ring-1 ring-white/10 lg:block"
          >
            <Image
              data-tilt-img
              src={nightTaxiImg}
              alt={t("demoImageAlt")}
              placeholder="blur"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-full max-h-[560px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Honesty / confidence tiers */}
      <section className="bg-sand/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p data-reveal className={`${KICKER} text-terracotta`}>
            {t("honestyKicker")}
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-zellige-strong sm:text-5xl"
          >
            {t("honestyTitle")}
          </h2>
          <p data-reveal className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-muted">
            {t("honestySub")}
          </p>
          <div data-reveal>
            <TierLegend className="mt-8" />
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p data-reveal className={`${KICKER} text-terracotta`}>
          {t("citiesKicker")}
        </p>
        <h2
          data-reveal
          className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-zellige-strong sm:text-5xl"
        >
          {t("coverageTitle")}
        </h2>
        <p data-reveal className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-muted">
          {t("coverageSub")}
        </p>

        <div data-reveal-group className="mt-10 grid gap-5 sm:grid-cols-3">
          {CITY_GUIDES.map((city) => {
            const image =
              CITY_IMAGES[city.imageSlot as keyof typeof CITY_IMAGES];
            return (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                data-reveal
                data-tilt
                className="group relative block overflow-hidden rounded-3xl bg-zellige-strong"
              >
                <div data-arch className="relative aspect-[4/5] overflow-hidden">
                  {image && (
                    <Image
                      data-tilt-img
                      src={image}
                      alt={pickLocale(city.name, locale)}
                      fill
                      placeholder="blur"
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover"
                    />
                  )}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--ink)_80%,transparent),transparent_55%)]"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {pickLocale(city.name, locale)}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-white/85">
                    {pickLocale(city.tagline, locale)}
                  </p>
                  <span className="mt-3 inline-flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-saffron text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          <figure data-reveal>
            <div data-map>
              <MoroccoMap labels={mapLabels} className="mx-auto max-w-md lg:max-w-none" />
            </div>
            <figcaption className="mt-3 text-center text-[12px] text-ink-faint">
              {t("mapCaption")}
            </figcaption>
          </figure>
          <div data-reveal>
            <p className="text-[15px] leading-7 text-ink-muted">
              {tCities("comingSoon")}: {tCityNames("tangier")} · {tCityNames("fes")}
            </p>
            <Link
              href="/cities"
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-card px-6 text-base font-semibold text-ink transition-colors hover:border-zellige hover:text-zellige"
            >
              {tCities("title")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Rail interlude */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <Image
            data-parallax-img
            src={railImg}
            alt=""
            fill
            placeholder="blur"
            sizes="100vw"
            className="scale-110 object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--ink)_85%,transparent),color-mix(in_srgb,var(--ink)_35%,transparent)_60%,color-mix(in_srgb,var(--ink)_20%,transparent))]" />
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 py-28 sm:px-6 sm:py-36">
          <p data-reveal className={`${KICKER} text-saffron`}>
            {t("railKicker")}
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl"
          >
            {t("railTitle")}
          </h2>
          <p data-reveal className="mt-4 max-w-xl text-[15px] leading-7 text-white/85">
            {t("railBody")}
          </p>
          <div data-reveal-group className="mt-12 grid max-w-3xl grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} data-reveal>
                <p className="font-display text-4xl font-semibold text-saffron sm:text-6xl">
                  <span data-count-to={stat.value}>{stat.value}</span>
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] leading-5 text-white/70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <div data-reveal className="mt-12">
            <Link href="/plan" data-magnetic className={PRIMARY_CTA}>
              {t("ctaPlan")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Offline pack CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div data-reveal className="grain relative overflow-hidden rounded-[2rem] bg-zellige-strong">
          <div className="absolute inset-0" aria-hidden>
            <Image
              src={packImg}
              alt=""
              fill
              placeholder="blur"
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--zellige-strong)_92%,transparent),color-mix(in_srgb,var(--zellige-strong)_40%,transparent))] rtl:bg-[linear-gradient(to_left,color-mix(in_srgb,var(--zellige-strong)_92%,transparent),color-mix(in_srgb,var(--zellige-strong)_40%,transparent))]" />
          </div>
          <div className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
            <div className="max-w-xl">
              <p className={`${KICKER} text-saffron`}>
                <span data-wifi className="flex items-center gap-1.5" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                    <path
                      data-wifi-arc
                      d="M2.5 9a14.5 14.5 0 0 1 19 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      data-wifi-arc
                      d="M6 12.5a9.5 9.5 0 0 1 12 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      data-wifi-arc
                      d="M9.5 16a4.8 4.8 0 0 1 5 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="19.5" r="1.5" fill="currentColor" />
                  </svg>
                  <span data-wifi-star className="block">
                    <StarMark className="h-4 w-4" />
                  </span>
                </span>
                {t("packTitle")}
              </p>
              <p className="mt-4 text-[15px] leading-7 text-white/85">{t("packBody")}</p>
            </div>
            <Link href="/packs" data-magnetic className={`${PRIMARY_CTA} shrink-0`}>
              {t("packCta")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <LandingMotion />
    </main>
  );
}
