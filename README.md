# Morocco Next Move

**Know your best next move in Morocco.** A mobile-first, offline-capable travel
companion that answers one question honestly: *from where you are standing right
now, what is the safest, fastest, cheapest next action — and how confident are we
in that answer?*

Not a booking app. A confidence-tiered orchestration layer over Morocco's
fragmented transport landscape: rail (ONCF), urban trams (Casablanca, Rabat),
petit taxis, and last-mile medina navigation — with deep links to official
operators instead of rebuilt ticketing.

## Core ideas

- **Confidence tiers are data, not decoration.** Every schedule, pin, and fare
  carries a provenance record and one of three tiers: `official-live`,
  `cached-verified`, or `estimated-flagged` ("last confirmed 3 days ago").
- **Offline is architectural.** The ranking engine is pure TypeScript that runs
  identically server-side and in the browser on cached city-pack data.
- **Trilingual from day one.** English, French, Arabic — with full RTL.

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS 4 · next-intl ·
zod · vitest · MapLibre GL + PMTiles · IndexedDB (idb)

## Architecture

```
src/
  core/   Pure domain types + ranking engine. No framework imports (lint-enforced).
  data/   Provider adapters + seed datasets. Every record has provenance + lastVerifiedAt.
  i18n/   Locale routing + en/fr/ar message catalogs.
  ui/     Design system ("Zellige & Terracotta" tokens in app/globals.css).
  lib/    Client utilities: cn(), analytics seam, IndexedDB helpers, pack manager.
  app/    Thin App Router routes: parse URL → call engine → render.
scripts/  Seed builders (GTFS → validated JSON).
```

Dependency rule: `app → ui/data/core`, `data → core`, `core → zod only`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run test       # engine fixture suites (vitest)
npm run typecheck
npm run lint
npm run build && npm run start
```

## Data & licensing

Transport seeds derive from the community ONCF GTFS feed (ODbL), official
operator timetables (manually transcribed, with provenance), and OpenStreetMap
(ODbL). Attribution lives at `/about/sources`. No operator front ends are
scraped.
