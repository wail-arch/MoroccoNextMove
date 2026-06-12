import { useTranslations } from "next-intl";
import { StarMark } from "@/ui/Logo";

/*
 * First-visit intro overlay ("Laying the first tile"). Server-rendered so it
 * covers the hero before hydration; three escape hatches keep it honest:
 *
 *  - return visits: the inline script below hides it synchronously (before
 *    paint) when sessionStorage says the intro already ran this session;
 *  - no JS: <noscript> hides it — static visitors see the composed hero;
 *  - reduced motion: globals.css hides it via the media query.
 *
 * The star is the loading indicator: LandingMotion fills the terracotta copy
 * (clip-path) with real load progress — fonts, then hero image decode — then
 * lays the tile grid, flips it away, and removes the overlay.
 */
export function HeroIntro() {
  const t = useTranslations("common");

  return (
    <>
      <div
        data-intro
        aria-hidden
        className="absolute inset-0 z-30 flex items-center justify-center bg-plaster"
      >
        <span data-intro-star className="relative block h-12 w-12">
          <span className="absolute inset-0 text-sand">
            <StarMark className="h-12 w-12" />
          </span>
          <span
            data-intro-star-fill
            className="absolute inset-0 text-terracotta"
            style={{ clipPath: "inset(100% 0 0 0)" }}
          >
            <StarMark className="h-12 w-12" />
          </span>
          <span className="sr-only">{t("loading")}</span>
        </span>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(sessionStorage.getItem('nm-intro'))document.currentScript.previousElementSibling.style.display='none'}catch(e){}",
        }}
      />
      <noscript>
        <style>{"[data-intro]{display:none}"}</style>
      </noscript>
    </>
  );
}
