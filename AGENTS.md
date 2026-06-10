<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. Notably: `middleware.ts` is deprecated — this project uses `src/proxy.ts`.
<!-- END:nextjs-agent-rules -->

# Project rules

- **Architecture boundaries (lint-enforced):** `src/core` is pure domain + engine — zod and core-internal imports only, no react/next. `src/data` may import core/lib only. `src/app` stays thin: parse URL → call engine → render.
- **Design tokens only:** colors come from the `@theme` tokens in `src/app/globals.css` (zellige, terracotta, saffron, plaster, tier-*). No raw hex values in components.
- **RTL-safe styles:** use logical Tailwind utilities (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`) — never `pl-`/`pr-`/`ml-`/`mr-` — because Arabic renders the whole app in RTL.
- **i18n:** every user-facing string goes through next-intl (`src/i18n/messages/{en,fr,ar}.json`). No hardcoded copy in components.
- **Provenance is mandatory:** every seed record carries `provenance` + `lastVerifiedAt` and a confidence tier. Never invent schedule data without flagging it `estimated-flagged`.
- **Mobile-first:** design for 390px, one hand, weak connectivity. Tap targets ≥ 44px. No carousels or modals in critical paths.
- **Verify with:** `npm run typecheck && npm run lint && npm run test` before committing.
