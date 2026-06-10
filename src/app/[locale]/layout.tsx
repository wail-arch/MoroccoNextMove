import type { Metadata } from "next";
import { Fraunces, Inter, Readex_Pro } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isRtlLocale, routing } from "@/i18n/routing";
import { OfflineBanner } from "@/ui/OfflineBanner";
import { SiteFooter } from "@/ui/SiteFooter";
import { SiteHeader } from "@/ui/SiteHeader";
import { SwRegister } from "@/ui/SwRegister";
import "../globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const readexPro = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  const tLanding = await getTranslations({ locale, namespace: "landing" });

  return {
    title: {
      default: t("fullName"),
      template: `%s · ${t("fullName")}`,
    },
    description: tLanding("heroSub"),
    applicationName: t("fullName"),
    metadataBase: new URL(siteUrl),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      className={`${fraunces.variable} ${inter.variable} ${readexPro.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <SwRegister />
          <OfflineBanner />
          <SiteHeader />
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
