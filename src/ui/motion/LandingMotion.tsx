"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

/*
 * Single GSAP orchestrator for the landing page. The page itself stays fully
 * server-rendered; this component only reads data-* hooks from the DOM:
 *
 *   data-intro / data-intro-star-fill                      first-visit mosaic intro
 *   data-hero / data-hero-media / data-hero-image          hero choreography
 *   data-split / data-fade / data-hero-pin(-chip|-dot)
 *   data-reveal / data-reveal-group                        scroll reveals
 *   data-marquee-track                                     infinite marquee
 *   data-demo / data-demo-row / data-demo-route /          engine theatre
 *   data-demo-best / data-demo-minutes / data-factor
 *   data-count-to                                          stat counters (digit blur)
 *   data-parallax-img                                      full-bleed parallax
 *   data-map / data-map-route                              coverage map draw
 *   data-arch                                              arch-mask image reveals
 *   data-wifi(-arc|-star)                                  offline pack icon story
 *   data-magnetic / data-tilt / data-tilt-img              pointer micro-interactions
 *   data-progress                                          scroll progress hairline
 *
 * Motion rules: assured power-eases everywhere; overshoot is reserved for the
 * two "physical" moments (pin drop, badge stamp). Honors prefers-reduced-motion
 * (renders nothing, content stays static) and RTL (directional moves flip;
 * the intro's radial moments are direction-neutral by design).
 */

/** Lantern glow positions, % of the hero photograph (hand-placed). */
const LANTERNS = [
  { x: 78, y: 71 },
  { x: 63, y: 80 },
  { x: 36, y: 77 },
  { x: 86, y: 62 },
  { x: 27, y: 66 },
];

const INTRO_SEEN_KEY = "nm-intro";

/** Photographed zellige tesserae (one sheet, one light — see images.manifest). */
const TILE_FILES = [
  "star-01-emerald.webp",
  "star-02-cobalt.webp",
  "star-03-emerald.webp",
  "star-04-amber.webp",
  "star-05-white.webp",
  "star-06-amber.webp",
  "star-07-cobalt.webp",
  "star-08-white.webp",
  "star-09-emerald.webp",
  "star-10-white.webp",
  "star-11-emerald.webp",
].map((f) => `/images/tiles/${f}`);

/** Deterministic per-piece wobble so the wall lays the same way every time. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function introSeen(): boolean {
  try {
    return Boolean(sessionStorage.getItem(INTRO_SEEN_KEY));
  } catch {
    return false;
  }
}

function markIntroSeen(): void {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Private mode — the intro will simply replay next visit.
  }
}

export function LandingMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin);
    const rtl = document.documentElement.dir === "rtl";
    const dir = rtl ? -1 : 1;

    const lenis = new Lenis({ lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {});
    let cancelled = false;
    const skipCleanups: Array<() => void> = [];
    /** Run setup inside the gsap context so unmount reverts everything. */
    const safe = (fn: () => void) => {
      if (!cancelled) ctx.add(fn);
    };

    // ------------------------------------------------------------------ hero

    /** Shared hero entrance; the intro path layers it under the tile flip. */
    function heroEntrance(viaIntro: boolean): gsap.core.Timeline {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const hero = document.querySelector("[data-hero]");
      if (!hero) return tl;
      const img = hero.querySelector("[data-hero-image]");
      const media = hero.querySelector("[data-hero-media]");
      const headline = hero.querySelector("[data-split]");
      const fades = hero.querySelectorAll("[data-fade]");
      const pin = hero.querySelector("[data-hero-pin]");
      const pinChip = hero.querySelector("[data-hero-pin-chip]");
      const pinDot = hero.querySelector("[data-hero-pin-dot]");

      if (img) {
        tl.fromTo(
          img,
          { scale: viaIntro ? 1.12 : 1.18 },
          { scale: 1, duration: viaIntro ? 1.8 : 2.4, ease: "power2.out" },
          0,
        );
      }

      // Dawn sweep: a warm band passes across the photograph once.
      if (media) {
        const sweep = document.createElement("div");
        sweep.style.cssText = [
          "position:absolute",
          "top:-10%",
          "height:120%",
          "width:34%",
          "left:0",
          "pointer-events:none",
          "background:linear-gradient(75deg,transparent,color-mix(in srgb,var(--saffron) 38%,transparent),transparent)",
          "mix-blend-mode:soft-light",
          "opacity:0",
        ].join(";");
        media.appendChild(sweep);
        tl.fromTo(
          sweep,
          { xPercent: dir * -160, opacity: 0.9 },
          { xPercent: dir * 460, opacity: 0.55, duration: 1.5, ease: "power1.inOut" },
          viaIntro ? 0.1 : 0.4,
        ).set(sweep, { display: "none" });

        // Lanterns bloom on where they exist in the photo, then keep a
        // barely-perceptible flicker so the page feels alive at idle.
        const dots = LANTERNS.map(({ x, y }) => {
          const dot = document.createElement("span");
          dot.style.cssText = [
            "position:absolute",
            `left:${x}%`,
            `top:${y}%`,
            "width:6px",
            "height:6px",
            "border-radius:9999px",
            "background:var(--saffron)",
            "box-shadow:0 0 14px 5px color-mix(in srgb,var(--saffron) 55%,transparent)",
            "opacity:0",
            "pointer-events:none",
          ].join(";");
          media.appendChild(dot);
          return dot;
        });
        tl.to(
          dots,
          { opacity: 0.9, scale: 1, duration: 0.5, stagger: 0.12, ease: "power2.out" },
          viaIntro ? 0.9 : 1.1,
        );
        dots.forEach((dot, i) => {
          gsap.to(dot, {
            opacity: 0.55,
            duration: 0.9 + i * 0.17,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: 1.6 + i * 0.3,
          });
        });
      }

      if (headline) {
        const split = SplitText.create(headline, { type: "words", mask: "words" });
        tl.fromTo(
          split.words,
          { yPercent: 120, rotation: 2 },
          { yPercent: 0, rotation: 0, duration: 1.05, stagger: 0.07 },
          viaIntro ? 0.35 : 0.25,
        );
      }
      if (fades.length) {
        tl.fromTo(
          fades,
          { y: 28, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12 },
          viaIntro ? 0.8 : 0.7,
        );
      }

      // The proof: a verified pin drops beside the Koutoubia (one of the two
      // allowed overshoots), its chip stamps in, the dot keeps a slow pulse.
      if (pin) {
        tl.fromTo(
          pin,
          { autoAlpha: 0, y: -36 },
          { autoAlpha: 1, y: 0, duration: 0.65, ease: "back.out(2.8)" },
          viaIntro ? 1.7 : 1.9,
        );
        if (pinChip) {
          tl.fromTo(
            pinChip,
            { autoAlpha: 0, scale: 0.6, y: 6, transformOrigin: "50% 100%" },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2.5)" },
            "<+0.3",
          );
        }
        if (pinDot) {
          gsap.to(pinDot, {
            scale: 1.3,
            opacity: 0.7,
            duration: 1.4,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: 3,
          });
        }
      }

      // Parallax on scroll.
      if (img) {
        gsap.to(img, {
          yPercent: 14,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
        });
      }
      return tl;
    }

    // ------------------------------------------------------- first-visit intro

    function runIntro(overlay: HTMLElement) {
      lenis.stop();
      const starFill = overlay.querySelector("[data-intro-star-fill]");
      const star = overlay.querySelector("[data-intro-star]");
      const progress = { value: 0.1 };
      const renderFill = () => {
        if (starFill) {
          gsap.set(starFill, {
            clipPath: `inset(${(1 - progress.value) * 100}% 0 0 0)`,
          });
        }
      };
      // Fonts are already ready (we init after document.fonts.ready).
      gsap.to(progress, { value: 0.45, duration: 0.4, ease: "power1.out", onUpdate: renderFill });

      let started = false;
      const begin = () =>
        safe(() => {
          if (started) return;
          started = true;
          // The decode promise can win the race against first layout; wait
          // until the overlay has real geometry before building the grid.
          let attempts = 0;
          const go = () => {
            if (cancelled) return;
            const ready = overlay.getBoundingClientRect().width > 100;
            if (!ready && attempts++ < 60) {
              requestAnimationFrame(go);
              return;
            }
            safe(() => playIntro(overlay, star, starFill, progress, renderFill));
          };
          go();
        });

      // Real progress: hero photo decode carries to 75%, the tesserae set
      // carries the rest. The wall is only laid from loaded material.
      const img = document.querySelector<HTMLImageElement>("[data-hero-image]");
      const decoded = img?.decode ? img.decode().catch(() => {}) : Promise.resolve();
      void decoded.then(() => {
        if (cancelled) return;
        gsap.to(progress, { value: 0.75, duration: 0.4, ease: "power1.out", onUpdate: renderFill });
      });

      let loadedTiles = 0;
      const tilePromises = TILE_FILES.map(
        (src) =>
          new Promise<void>((resolve) => {
            const tile = new Image();
            tile.onload = tile.onerror = () => {
              loadedTiles += 1;
              if (!cancelled) {
                gsap.to(progress, {
                  value: Math.max(progress.value, 0.75 + (0.25 * loadedTiles) / TILE_FILES.length),
                  duration: 0.3,
                  onUpdate: renderFill,
                });
              }
              resolve();
            };
            tile.src = src;
          }),
      );

      void Promise.all([decoded, ...tilePromises]).then(begin);
      // Never hold travelers hostage to a slow connection.
      window.setTimeout(begin, 4500);
    }

    function playIntro(
      overlay: HTMLElement,
      star: Element | null,
      starFill: Element | null,
      progress: { value: number },
      renderFill: () => void,
    ) {
      /*
       * A wall of photographed tesserae. Eight-pointed stars (the brand mark)
       * sit on a square lattice of period 2R; their tips touch, and the
       * concave crosses between them stay bare plaster — a zellij wall midway
       * through being laid. Every star is a real glazed tile cut from one
       * photographed sheet (one camera, one raking light), placed with a
       * craftsman's wobble: ±2° rotation, ±2px drift, uneven brightness.
       */
      const rect = overlay.getBoundingClientRect();
      const width = rect.width > 100 ? rect.width : window.innerWidth;
      const height = rect.height > 100 ? rect.height : window.innerHeight;
      const cap = width < 640 ? 30 : 48;
      let period = width < 640 ? Math.max(140, width / 3.2) : Math.max(190, width / 7);
      const pieceCount = (p: number) =>
        (Math.ceil(width / p) + 1) * (Math.ceil(height / p) + 1);
      while (pieceCount(period) > cap) period *= 1.2;
      const radius = period / 2;
      const cols = Math.ceil(width / period);
      const rows = Math.ceil(height / period);

      const layer = document.createElement("div");
      layer.style.cssText = "position:absolute;inset:0;overflow:hidden";
      overlay.appendChild(layer);

      const cx = width / 2;
      const cy = height / 2;
      const maxD = Math.hypot(cx, cy);
      const tiles: Array<{
        el: HTMLDivElement;
        d: number;
        rot: number;
        outX: number;
        outY: number;
      }> = [];

      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const seed = i * 31 + j * 57;
          const centerX = i * period + (jitter(seed) - 0.5) * 4;
          const centerY = j * period + (jitter(seed + 1) - 0.5) * 4;
          const rot = (jitter(seed + 2) - 0.5) * 4;
          const brightness = 0.95 + jitter(seed + 3) * 0.09;
          const el = document.createElement("div");
          el.style.cssText = [
            "position:absolute",
            `left:${centerX - radius}px`,
            `top:${centerY - radius}px`,
            `width:${period}px`,
            `height:${period}px`,
            // Coprime walk through the 11 tiles so neighbours never repeat.
            `background-image:url(${TILE_FILES[(i * 5 + j * 3) % TILE_FILES.length]})`,
            // Slight oversize so the hand-cut tips actually meet.
            "background-size:107% 107%",
            "background-position:center",
            `filter:brightness(${brightness.toFixed(3)}) drop-shadow(0 2px 3px color-mix(in srgb, var(--ink) 22%, transparent))`,
            "opacity:0",
            "will-change:transform,opacity",
          ].join(";");
          layer.appendChild(el);
          tiles.push({
            el,
            d: Math.hypot(centerX - cx, centerY - cy) / maxD,
            rot,
            outX: (centerX - cx) * 0.45,
            outY: (centerY - cy) * 0.45,
          });
        }
      }
      const tl = gsap.timeline({
        onComplete: finish,
        defaults: { ease: "power2.out" },
      });

      // Beat 0 → 1: star completes, locks with a quarter-spin, hands off.
      tl.to(progress, { value: 1, duration: 0.35, ease: "power1.in", onUpdate: renderFill });
      if (star) {
        tl.to(star, { rotation: 45, scale: 1.12, duration: 0.45, ease: "back.out(2)" });
      }

      // Beat 1: stars lay themselves outward from the loader star, radially,
      // like a craftsman working from the first tile — each locks in from an
      // eighth-turn (its own symmetry angle) and settles into its wobble.
      tl.addLabel("lay", "<+0.2");
      tiles.forEach(({ el, d, rot }) => {
        tl.fromTo(
          el,
          { opacity: 0, rotation: 22.5 + rot, scale: 0.7 },
          { opacity: 1, rotation: rot, scale: 1, duration: 0.4, ease: "power2.out" },
          `lay+=${d * 0.55}`,
        );
      });
      if (star) {
        tl.to(star, { autoAlpha: 0, scale: 0.6, duration: 0.4, ease: "power2.in" }, "lay+=0.3");
      }

      // The glaze catches the light once across the finished wall.
      const sheen = document.createElement("div");
      sheen.style.cssText = [
        "position:absolute",
        "top:-10%",
        "height:120%",
        "width:30%",
        "left:0",
        "pointer-events:none",
        "background:linear-gradient(105deg, transparent, color-mix(in srgb, white 32%, transparent), transparent)",
        "mix-blend-mode:screen",
        "opacity:0",
      ].join(";");
      layer.appendChild(sheen);
      tl.fromTo(
        sheen,
        { xPercent: dir * -140, opacity: 1 },
        { xPercent: dir * 440, opacity: 0.7, duration: 0.85, ease: "power1.inOut" },
        "lay+=1.0",
      ).set(sheen, { display: "none" });

      // Beat 2: the camera pushes through the wall — stars part toward the
      // viewer, centre first, and Marrakech is on the other side.
      tl.addLabel("flip", "lay+=1.45");
      tiles.forEach(({ el, d, outX, outY }) => {
        tl.to(
          el,
          {
            scale: 2.1,
            x: outX,
            y: outY,
            autoAlpha: 0,
            duration: 0.65,
            ease: "power2.in",
          },
          `flip+=${d * 0.5}`,
        );
      });
      tl.set(overlay, { background: "transparent", pointerEvents: "none" }, "flip+=0.05");
      tl.add(heroEntrance(true), "flip+=0.2");

      // Any input skips straight to the composed page.
      const skip = () => tl.progress(1);
      const opts: AddEventListenerOptions = { once: true, passive: true };
      window.addEventListener("wheel", skip, opts);
      window.addEventListener("touchstart", skip, opts);
      window.addEventListener("pointerdown", skip, opts);
      window.addEventListener("keydown", skip, opts);
      skipCleanups.push(() => {
        window.removeEventListener("wheel", skip);
        window.removeEventListener("touchstart", skip);
        window.removeEventListener("pointerdown", skip);
        window.removeEventListener("keydown", skip);
      });

      function finish() {
        gsap.set(overlay, { display: "none" });
        markIntroSeen();
        lenis.start();
        ScrollTrigger.refresh();
      }
    }

    // -------------------------------------------------------- engine theatre

    function setupEngineTheatre() {
      const demo = document.querySelector<HTMLElement>("[data-demo]");
      if (!demo) return;
      const rowEls = gsap.utils.toArray<HTMLElement>("[data-demo-row]", demo);
      const parent = rowEls[0]?.parentElement;
      if (!parent || rowEls.length < 2) {
        // Single result — no ranking to dramatize, just reveal it.
        gsap.from(rowEls, {
          x: 48 * dir,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: demo, start: "top 75%" },
        });
        return;
      }

      const route = document.querySelector<HTMLElement>("[data-demo-route]");
      const factors = gsap.utils.toArray<HTMLElement>("[data-factor]");
      const best = demo.querySelector("[data-demo-best]");
      const badges = rowEls
        .map((r) => r.querySelector(".mt-1"))
        .filter((el): el is Element => Boolean(el));
      const minuteEls = rowEls
        .map((r) => r.querySelector<HTMLElement>("[data-demo-minutes]"))
        .filter((el): el is HTMLElement => Boolean(el));

      // Present rows in reverse rank order first — the engine hasn't
      // "decided" yet — then FLIP-sort them into the real ranking.
      [...rowEls].reverse().forEach((r) => parent.appendChild(r));

      gsap.set(rowEls, { autoAlpha: 0, x: 48 * dir, filter: "grayscale(1) brightness(0.85)" });
      if (best) gsap.set(best, { autoAlpha: 0 });
      if (badges.length) gsap.set(badges, { autoAlpha: 0 });
      if (route) {
        gsap.set(route, { clipPath: rtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" });
      }
      minuteEls.forEach((el) => {
        el.textContent = (el.textContent ?? "").replace(/\d+/, "0");
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: demo, start: "top 72%" },
      });

      // 1 — the query writes itself.
      if (route) {
        tl.to(route, { clipPath: "inset(0 0% 0 0%)", duration: 0.7, ease: "power1.inOut" });
      }
      // 2 — candidates surface, unranked and grey.
      tl.to(rowEls, { autoAlpha: 1, x: 0, duration: 0.55, stagger: 0.14 }, "-=0.1");
      // 3 — the engine considers: factor chips pulse in sequence.
      if (factors.length) {
        tl.to(
          factors,
          {
            scale: 1.12,
            duration: 0.2,
            ease: "power2.inOut",
            stagger: { each: 0.16, yoyo: true, repeat: 1 },
          },
          "+=0.05",
        );
      }
      // 4 — rows colorize while their minutes tick up to the real values.
      tl.addLabel("consider", "+=0.1");
      rowEls.forEach((row, i) => {
        const at = `consider+=${i * 0.18}`;
        tl.to(row, { filter: "grayscale(0) brightness(1)", duration: 0.5 }, at);
        const el = row.querySelector<HTMLElement>("[data-demo-minutes]");
        const target = Number(el?.dataset.demoMinutes ?? 0);
        if (el && target > 0) {
          const proxy = { v: 0 };
          tl.to(
            proxy,
            {
              v: target,
              duration: 0.6,
              ease: "power1.out",
              onUpdate: () => {
                el.textContent = (el.textContent ?? "").replace(
                  /\d+/,
                  String(Math.round(proxy.v)),
                );
              },
            },
            at,
          );
        }
      });
      // 5 — the ranking happens: rows FLIP into rank order.
      tl.add(() => {
        const state = Flip.getState(rowEls);
        [...rowEls]
          .sort((a, b) => Number(a.dataset.rank ?? 0) - Number(b.dataset.rank ?? 0))
          .forEach((r) => parent.appendChild(r));
        Flip.from(state, { duration: 0.75, ease: "power3.inOut" });
      }, "+=0.3");
      // 6 — provenance stamps in (second allowed overshoot), winner crowned.
      if (badges.length) {
        tl.fromTo(
          badges,
          {
            autoAlpha: 0,
            scale: 1.5,
            rotation: -4 * dir,
            transformOrigin: rtl ? "100% 50%" : "0% 50%",
          },
          {
            autoAlpha: 1,
            scale: 1,
            rotation: 0,
            duration: 0.45,
            ease: "back.out(2.5)",
            stagger: 0.12,
          },
          "+=0.9",
        );
      }
      if (best) {
        tl.fromTo(
          best,
          { autoAlpha: 0, scale: 0 },
          { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.5)" },
          "<+0.25",
        );
      }
    }

    // ------------------------------------------------------------ everything

    function initAll() {
      const progress = document.querySelector("[data-progress]");
      if (progress) {
        gsap.fromTo(
          progress,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4 } },
        );
      }

      // Hero: full mosaic intro on first visit, straight entrance otherwise.
      const overlay = document.querySelector<HTMLElement>("[data-intro]");
      const introEligible =
        overlay && !introSeen() && getComputedStyle(overlay).display !== "none";
      if (overlay && !introEligible) gsap.set(overlay, { display: "none" });
      if (introEligible && overlay) {
        runIntro(overlay);
      } else {
        heroEntrance(false);
      }

      // Generic scroll reveals (grouped items stagger together).
      const grouped = new Set<Element>();
      document.querySelectorAll("[data-reveal-group]").forEach((group) => {
        const items = group.querySelectorAll("[data-reveal]");
        items.forEach((el) => grouped.add(el));
        gsap.from(items, {
          y: 36,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: group, start: "top 82%" },
        });
      });
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (grouped.has(el)) return;
        gsap.from(el, {
          y: 36,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // Marquee: seamless loop (track holds two identical lists).
      const track = document.querySelector("[data-marquee-track]");
      if (track) {
        gsap.to(track, { xPercent: -50 * dir, repeat: -1, duration: 26, ease: "none" });
      }

      // Stat counters: digits blur with speed while counting, snap sharp at
      // the target. Server renders the final value; reset to 0 only with JS.
      document.querySelectorAll<HTMLElement>("[data-count-to]").forEach((el) => {
        const target = Number(el.dataset.countTo ?? 0);
        const proxy = { value: 0 };
        el.textContent = "0";
        // Inline spans can't take transforms or filters.
        gsap.set(el, { display: "inline-block", transformOrigin: "50% 80%" });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
        tl.to(proxy, {
          value: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = String(Math.round(proxy.value));
          },
        });
        if (target > 0) {
          tl.to(el, { scaleX: 1.12, filter: "blur(2px)", duration: 0.25, ease: "power1.in" }, 0)
            .to(el, { scaleX: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, 1.55);
        }
      });

      // Full-bleed parallax images.
      document.querySelectorAll<HTMLElement>("[data-parallax-img]").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest("section") ?? img,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      // Coverage map narrates the rollout: region borders draw, regions
      // flood-fill, city pins drop in launch order, the corridor traces.
      const map = document.querySelector("[data-map]");
      if (map) {
        const regions = gsap.utils.toArray<SVGPathElement>("path:not([data-map-route])", map);
        const routePath = map.querySelector<SVGPathElement>("[data-map-route]");
        const markers = map.querySelectorAll("g");
        const mapTl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: map, start: "top 80%" },
        });
        mapTl
          .set(regions, { drawSVG: "0%", fillOpacity: 0, stroke: "var(--zellige)" })
          .to(regions, { drawSVG: "100%", duration: 0.9, stagger: 0.025, ease: "power1.inOut" })
          .to(regions, { fillOpacity: 1, duration: 0.5, stagger: 0.02 }, "-=0.35")
          .to(regions, { stroke: "var(--plaster)", duration: 0.4 }, "<");
        mapTl.from(
          markers,
          {
            scale: 0,
            transformOrigin: "50% 50%",
            duration: 0.6,
            ease: "back.out(2.2)",
            stagger: 0.12,
          },
          "-=0.2",
        );
        if (routePath) {
          mapTl.from(routePath, { autoAlpha: 0, duration: 0.6 }, "-=0.3");
          // Marching dots: the corridor route is always quietly in motion.
          gsap.to(routePath, { strokeDashoffset: -26, duration: 2.2, repeat: -1, ease: "none" });
        }
      }

      setupEngineTheatre();

      // City images reveal through an opening Moroccan arch.
      document.querySelectorAll<HTMLElement>("[data-arch]").forEach((arch) => {
        const img = arch.querySelector("[data-tilt-img]");
        const archTl = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          scrollTrigger: { trigger: arch, start: "top 85%" },
        });
        archTl.fromTo(
          arch,
          { clipPath: "inset(34% 24% 0% 24% round 999px 999px 0px 0px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", duration: 1.1 },
        );
        if (img) archTl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.1 }, 0);
      });

      // Offline pack icon tells its story: signal dies, the star stays lit.
      const wifi = document.querySelector("[data-wifi]");
      if (wifi) {
        const arcs = wifi.querySelectorAll("[data-wifi-arc]");
        const starMark = wifi.querySelector("[data-wifi-star]");
        const wifiTl = gsap.timeline({
          scrollTrigger: { trigger: wifi, start: "top 85%" },
        });
        if (starMark) wifiTl.set(starMark, { autoAlpha: 0 }, 0);
        wifiTl.to(arcs, {
          autoAlpha: 0,
          y: -3,
          duration: 0.3,
          stagger: 0.22,
          ease: "power2.in",
          delay: 0.6,
        });
        if (starMark) {
          wifiTl.fromTo(
            starMark,
            { autoAlpha: 0, scale: 0.3 },
            { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(3)" },
          );
        }
      }

      // Pointer micro-interactions (precise pointers only).
      if (window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
          const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
          const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
          el.addEventListener("mousemove", (e) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
          });
          el.addEventListener("mouseleave", () => {
            xTo(0);
            yTo(0);
          });
        });

        document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
          gsap.set(card, { transformPerspective: 900 });
          const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power2" });
          const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power2" });
          const img = card.querySelector("[data-tilt-img]");
          card.addEventListener("mousemove", (e) => {
            const r = card.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 7);
            rx(((e.clientY - r.top) / r.height - 0.5) * -7);
          });
          card.addEventListener("mouseenter", () => {
            if (img) gsap.to(img, { scale: 1.06, duration: 0.8, ease: "power2.out" });
          });
          card.addEventListener("mouseleave", () => {
            rx(0);
            ry(0);
            if (img) gsap.to(img, { scale: 1, duration: 0.8, ease: "power2.out" });
          });
        });
      }

      ScrollTrigger.refresh();
    }

    // Webfonts must be ready before SplitText measures the headline.
    void document.fonts.ready.then(() => safe(initAll));

    return () => {
      cancelled = true;
      skipCleanups.forEach((fn) => fn());
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
