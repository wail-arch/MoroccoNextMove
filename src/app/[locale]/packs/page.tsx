import type { Metadata } from "next";
import { CheckCircle2, Smartphone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PackManager } from "./PackManager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "packs" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function PacksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("packs");

  const included = [
    t("included1"),
    t("included2"),
    t("included3"),
    t("included4"),
  ];

  return (
    <main id="content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-zellige-strong sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-7 text-ink-muted">
          {t("subtitle")}
        </p>
      </header>

      <div className="mt-6">
        <PackManager city="marrakech" />
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-base font-bold text-ink">{t("includedTitle")}</h2>
        <ul className="mt-3 grid gap-2.5">
          {included.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-6 text-ink-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zellige" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 flex gap-3 rounded-2xl border border-saffron/40 bg-saffron-soft p-5">
        <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-tier-cached" aria-hidden />
        <div>
          <h2 className="text-sm font-bold text-ink">{t("installTitle")}</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">{t("installBody")}</p>
        </div>
      </section>
    </main>
  );
}
