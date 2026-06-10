import type { MetadataRoute } from "next";
import { CITY_GUIDES } from "@/data/cities-content";
import { routing } from "@/i18n/routing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const ROUTES = [
  "",
  "/move",
  "/plan",
  "/cities",
  ...CITY_GUIDES.map((c) => `/cities/${c.slug}`),
  "/packs",
  "/about/sources",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    ROUTES.map((route) => ({
      url:
        locale === routing.defaultLocale
          ? `${siteUrl}${route || "/"}`
          : `${siteUrl}/${locale}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
  );
}
