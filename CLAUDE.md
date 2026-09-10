# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

Two independent projects live side-by-side. Each has its own working directory and build toolchain.

| Project | Path | Stack | Run |
|---|---|---|---|
| FinHire | `finhire/` | Next.js 16 + TypeScript + Tailwind v4 + Supabase | `cd finhire && npm run dev` |
| Flappy Bird | `flappy-bird/` | Vanilla JS, single `index.html` | Open in browser |

## FinHire Commands

All commands run from `finhire/`:

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint (flat config, next-vitals + typescript)
npm run preview      # OpenNext preview on Cloudflare adapter
npm run deploy       # Build + deploy to Cloudflare Workers
npm run cf-typegen   # Generate Cloudflare env types
```

## FinHire Architecture

**Framework:** Next.js 16 App Router, React 19, TypeScript. Path alias `@/*` → `src/*`.

**Auth:** Supabase Auth with a cookie-based session bridge through middleware. The middleware (`src/middleware.ts`) uses `@supabase/ssr`'s `createServerClient` to read/write auth cookies on every request and redirect unauthenticated users from `/dashboard`, `/employer`, `/candidate`, `/admin` to `/login?redirect=...`. Server components use `src/lib/supabase/server.ts` (cookie-based), client components use `src/lib/supabase/client.ts` (localStorage-based). The barrel file `src/lib/supabase/index.ts` re-exports everything.

**Types:** Domain types live in `src/types/index.ts` (Profile, Job, Application, Match, etc.). The Supabase-generated types in `src/lib/supabase/database.types.ts` are a placeholder — regenerate with `npx supabase gen types typescript --project-id YOUR_PROJECT_ID` after migrations. Both type sources must stay in sync.

**State:** No global state library. Auth state is read from Supabase client in Server Components or the `use-auth.ts` hook in Client Components.

**AI:** `src/lib/ai/match.ts` contains the skill-based matching engine (pure function, no API call). OpenAI integration points are scaffolded in env vars but not yet wired into server actions.

**UI:** Shadcn-style primitives in `src/components/ui/` (Button, Input, Card, Badge, Textarea, Select). `next-themes` for dark/light mode. `sonner` for toasts.

**Deployment target:** Cloudflare Workers via `@opennextjs/cloudflare`. NOT Vercel. The `open-next.config.ts` uses default settings. Build artifacts go to `.open-next/`.

**Routing pattern:** API routes in `src/app/api/` are thin wrappers that call Supabase from Server Components / route handlers. Forms in `src/app/*/` have co-located form components and server action files (e.g., `post-job-form.tsx` + `actions.ts`).

**Role system:** Three roles — `employer`, `candidate`, `admin`. Role is stored on the `profiles` table. Role selection happens at `/register?type=...` and onboarding at `/onboarding/{employer,candidate}`. Protected routes are gated in middleware by path prefix only (no per-route role checks yet — add those as middleware matchers or route-level guards).

## Flappy Bird

Single `flappy-bird/index.html`, no build step. Open directly in a browser.
