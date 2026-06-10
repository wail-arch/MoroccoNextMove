import { getTranslations, setRequestLocale } from "next-intl/server";

// Placeholder landing — replaced by the real landing page in Phase 5.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">
        {t("name")}
      </p>
      <h1 className="font-display text-4xl font-semibold text-zellige-strong sm:text-5xl">
        {t("tagline")}
      </h1>
    </main>
  );
}
