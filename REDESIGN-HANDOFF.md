# Redesign handoff — `redesign/zellij-landing`

State of the landing-page motion redesign as of 2026-06-12, written so a fresh
machine (and a fresh AI assistant) can continue without the original session.

## What this branch contains

A full motion rebuild of the landing page (`src/app/[locale]/page.tsx`):

- **First-visit intro, "Laying the first tile"** — the brand star fills with
  *real* load progress (hero decode 75% → tesserae 100%), then a khatam
  lattice of photographed glazed tiles lays itself radially outward, a gloss
  sweep crosses the finished wall, and the camera pushes *through* the wall
  (tiles scale past the viewer, going translucent) into the Marrakech hero.
  Once per session (`sessionStorage` key `nm-intro`), skippable on any input,
  hidden for reduced-motion (CSS) and no-JS (`<noscript>`) visitors.
- **Engine theatre** — the "Watch it think" section runs the real
  `rankNextMoves()` on the server (rak-airport → jemaa-el-fnaa, pinned to
  Friday 10:35 for determinism), then presents rows unranked and grey,
  pulses the factor chips, ticks the minutes, FLIP-sorts into rank order
  and stamps the provenance badges.
- Hero dawn sweep + ambient lantern flicker (positions hand-placed for
  hero.jpg), masked headline typesetting, verified pin beside the Koutoubia
  (hidden < 640px where the object-cover crop shifts the landmark).
- Arch-mask reveals on city cards, map border-draw + marching-dots corridor
  route (route path added to `MoroccoMap.tsx`), rail counters with digit
  blur that snaps sharp at 320, offline-pack icon story (wifi arcs die, the
  star stays lit).
- Orchestrator: `src/ui/motion/LandingMotion.tsx` — one client component
  reading `data-*` hooks from the server-rendered page. GSAP plugins used:
  ScrollTrigger, SplitText, Flip, DrawSVG (all free since GSAP 3.13) +
  Lenis. Overlay markup: `src/ui/landing/HeroIntro.tsx`.

## Asset pipeline (all committed)

- `public/images/*.jpg` — eight editorial photographs + og-image, generated
  with Higgsfield `z_image` (0.15 credits each); slots and provenance in
  `public/images/images.manifest.json`.
- `public/images/tiles/star-*.webp` — 11 real glazed tesserae for the intro.
  Pipeline: ONE flat-lay sheet generation (single camera, single raking
  light — never generate tiles separately, lighting won't match) →
  Higgsfield `remove_background` → sliced by alpha-projection (PIL) →
  360px WebP. Raw sources lived in `asset-sources/` (gitignored, local
  only); regenerate or re-download from the Higgsfield account's generation
  history if ever needed.
- Higgsfield free plan notes: max 1 concurrent job, `z_image` works
  (0.15 cr), `soul_location` and high-tier `gpt_image_2` are paywalled.
  ~7.3 credits remained after all of this.

## Hard-won gotchas (do not relearn these)

1. **GSAP clears Tailwind v4 transforms.** GSAP 3.12+ sets the native
   `translate`/`rotate`/`scale` CSS properties to `none` on any element it
   animates. Never put `-translate-x-1/2`-style anchoring utilities on a
   GSAP-animated element — anchor a wrapper, animate the child (see the
   hero pin markup).
2. **`img.decode()` can win the race against first layout.** The intro
   overlay once measured 0×2400 and built a one-column grid. `playIntro`
   is gated behind an rAF poll until `getBoundingClientRect().width > 100`,
   plus an `innerWidth` fallback. Keep that.
3. **Lenis swallows programmatic scrolling.** `scrollIntoView`/`scrollTo`
   get overridden on the next frame. In browser automation, scroll by
   dispatching `WheelEvent`s — but note wheel events also trigger the
   intro's skip handler.
4. **Verifying timed animation with screenshot tooling:** tool latency
   (~3s) lands screenshots after short timelines finish. Temporarily expose
   the timeline (`window.__nmIntro = tl`) plus a `?introPause` query gate,
   then `seek(t)` forward from 0. Never scrub a *completed* timeline
   backwards — `onComplete` side effects (overlay `display:none`) are not
   timeline data and will lie to you. Screenshots can also serve stale GPU
   frames; flush with a double `requestAnimationFrame` before capturing,
   and re-shoot before believing a wrong-looking frame.
5. **Next 16 quirks in this repo:** read `AGENTS.md` first (design tokens
   only, logical RTL-safe utilities only, all copy through next-intl
   en/fr/ar, `src/core` stays framework-free). `next-env.d.ts` is generated
   on first dev/build run — static image imports won't typecheck until then.

## Verification

`npm run typecheck && npm run lint && npm run test` (45 unit tests), then
`npm run build && npm run test:e2e` (3 Playwright tests incl. the
kill-the-server offline drill; `npx playwright install chromium` once per
machine). All green at the last commit on this branch. To watch the intro
again: DevTools → `sessionStorage.clear()` → reload.

## Open ideas / known tradeoffs

- 11 unique tiles means a careful eye can find repeated stars across the
  wall (a coprime walk keeps direct neighbours distinct). A second sheet
  generation (~0.3 credits, same prompt reworded) doubles the vocabulary.
- The intro delays first-visit LCP by ~1.5s (session-gated, skippable).
  If this ever ships, watch bounce rate; the tessellation beat can compress
  to ~0.8s without redesign.
- Mid-flight theatre pacing was verified by end states + frame seeks, not a
  continuous human watch-through — give it one real viewing for feel.
- The pack-card wifi icon ends as star-only after its story plays; if the
  "offline" affordance feels lost, restore a crossed arc at the end.
