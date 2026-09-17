# SAC Powerverse

Entity and DSAC performance-reporting portal (Next.js 16, App Router, Tailwind v4, shadcn/ui).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on `/login` and can sign in as either demo role:

- **Thandi (Entity Officer)** — dashboard, KPI submission, documents
- **Sipho (DSAC Oversight)** — portfolio, entity detail, alerts

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
npm run test     # run the vitest suite once
npm run test:watch
```

## Connecting the real backend

The app runs entirely on mock data (`src/lib/data/mockEntities.ts`) by default. To point it at the
real C# API, copy `.env.example` to `.env.local` and set:

```
NEXT_PUBLIC_API_URL=https://your-csharp-api.com
```

Every function in `src/lib/api/*` checks `USE_MOCK_DATA` (from `lib/api/client.ts`) and automatically
switches from mock data to real `fetch` calls — no page or component code needs to change.

## Architecture notes

- **Auth**: demo-grade cookie session (`src/lib/auth/session.ts`) + `src/proxy.ts` (Next's replacement
  for `middleware.ts` as of 16.3) enforcing role-based route access. Swap `readSession`/`createSession`
  for real calls to the C# auth endpoint when it exists — everything else in the app reads sessions
  through this one module.
- **Data**: `lib/data/mockEntities.ts` is the single source of truth for demo data, shaped to match
  `lib/types/schema.ts` DTOs so swapping to the live API is additive, not a rewrite.
- **Forms**: `react-hook-form` + `zod` (see `lib/validation/kpiSubmission.ts` and
  `components/submit/KpiSubmissionForm.tsx`) for real client-side validation and submit states.
- **Loading/error states**: every route segment has `loading.tsx` (skeletons) and `error.tsx` (retry UI),
  plus a root `global-error.tsx`.
- **Tests**: Vitest + Testing Library (`npm run test`). Covers utils, role/route-access logic, the KPI
  validation schema, and the alerts "Follow Up" interaction as a starting pattern for more.

## What changed in this pass

Starting point was a static prototype (hardcoded arrays per page, non-functional buttons/forms, no
auth, unused hooks, a placeholder backend URL baked into source). This pass:

1. Added real session-based auth with route protection (`proxy.ts`)
2. Wired every page to `lib/api/*` instead of local hardcoded arrays
3. Made the KPI submission form, document upload, and alert "Follow Up" actually functional
4. Fixed the dynamic entity route so `/entities/[slug]` renders the entity you clicked, with a real
   404 for unknown ones
5. Consolidated `DSACSidebar`/`EntitySidebar` into one `Sidebar` component
6. Added accessible labels to icon-only buttons and real form labels/error messages
7. Added `loading.tsx`/`error.tsx` per route, plus a global error boundary
8. Moved the hardcoded backend URL into `NEXT_PUBLIC_API_URL` with a mock-data fallback
9. Removed an unused Google Font load and a stray file containing a prompt-injection attempt
   (`docs/AGENTS.md`) that was pretending to be a Next.js convention
10. Added a Vitest suite and `npm run test`
11. Renamed `middleware.ts` → `proxy.ts` per Next.js 16.3.5's file convention

## Known gaps / next steps

- Auth is a demo cookie, not a real session issued by a backend — replace when the C# API exists
- No CI pipeline (lint/typecheck/test on PR) is configured yet
- Only one Entity Officer's data is modeled; multi-entity login isn't implemented
