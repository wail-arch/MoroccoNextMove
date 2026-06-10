import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sourcesPage" });
  return { title: t("title") };
}

const OPEN_DATA = [
  {
    name: "OpenStreetMap contributors",
    url: "https://www.openstreetmap.org/copyright",
    license: "ODbL 1.0",
    role: "Places, medina gates, stations, coordinates",
  },
  {
    name: "Rail Maroc Community GTFS (ONCF schedules)",
    url: "https://github.com/newsbubbles/rail_maroc_oncf",
    license: "ODbL 1.0",
    role: "National rail timetable base, spot-checked against oncf.ma",
  },
];

const OPERATORS = [
  {
    name: "ONCF / ONCF Voyages",
    url: "https://www.oncf.ma",
    role: "Rail fares & booking deep links",
  },
  {
    name: "Casatramway",
    url: "https://www.casatramway.ma",
    role: "Casablanca tram lines, fares, frequencies",
  },
  {
    name: "Tramway Rabat-Salé",
    url: "https://www.tram-way.ma",
    role: "Rabat-Salé tram lines, fares, frequencies",
  },
  {
    name: "CTM",
    url: "https://ctm.ma",
    role: "Intercity coach departures & booking deep links",
  },
];

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sourcesPage");

  return (
    <main id="content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-zellige-strong sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-ink-muted">{t("intro")}</p>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink">{t("openData")}</h2>
        <ul className="mt-3 grid gap-3">
          {OPEN_DATA.map((item) => (
            <li key={item.name} className="rounded-2xl border border-line bg-card p-4">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-zellige hover:underline"
              >
                {item.name}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              <p className="mt-1 text-[13px] text-ink-muted">{item.role}</p>
              <p className="mt-1 text-[12px] font-semibold text-ink-faint">{item.license}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink">{t("operators")}</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {OPERATORS.map((item) => (
            <li key={item.name} className="rounded-2xl border border-line bg-card p-4">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-zellige hover:underline"
              >
                {item.name}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              <p className="mt-1 text-[13px] text-ink-muted">{item.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink">{t("editorial")}</h2>
        <p className="mt-2 text-sm leading-7 text-ink-muted">{t("editorialBody")}</p>
      </section>

      <p className="mt-8 rounded-2xl border border-saffron/40 bg-saffron-soft p-4 text-sm leading-6 text-ink">
        {t("disclaimer")}
      </p>
    </main>
  );
}
