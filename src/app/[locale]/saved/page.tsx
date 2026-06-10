import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SavedList } from "./SavedList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "saved" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function SavedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("saved");

  return (
    <main id="content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-zellige-strong sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-[15px] leading-7 text-ink-muted">{t("subtitle")}</p>
      </header>
      <SavedList />
    </main>
  );
}
