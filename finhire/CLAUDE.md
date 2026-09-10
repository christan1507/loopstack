# FinHire

AI-powered niche job board for AI/ML/quant/AI-compliance roles in finance.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL, Auth, Storage)
- OpenAI API (AI matching, cover letters)
- Vercel deployment

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # ESLint
```

## Project Structure

```
src/
  app/                    # App Router pages
    jobs/                 # Public job listings
    login/                # Auth pages
    register/             # Sign up with role selection
    post-job/             # Employer job posting form
    dashboard/
      candidate/          # Candidate dashboard (profile, applications, matches)
      employer/           # Employer dashboard (jobs, candidates, matches)
      admin/              # Admin stub
  components/
    ui/                   # Reusable UI primitives (Button, Input, Card, Badge)
    navbar.tsx            # Site navigation
    theme-toggle.tsx      # Dark/light mode
    theme-provider.tsx    # next-themes wrapper
  lib/
    utils.ts              # cn(), formatSalary(), formatDate(), relativeTime()
    supabase/
      client.ts           # Browser Supabase client
      server.ts           # Server Supabase client
      middleware.ts       # Auth middleware
      database.types.ts   # Supabase-generated types (placeholder)
      index.ts            # Barrel exports
  types/
    index.ts              # TypeScript interfaces for all DB entities
```

## Environment

Copy `.env.local.example` to `.env.local` and fill in Supabase and OpenAI keys.

## Database Schema

See Phase 2 plan. Tables: profiles, organizations, employers, candidates, skills,
candidate_skills, projects, certifications, jobs, job_skills, applications, matches, messages.

Generate types with:
```
npx supabase gen types typescript --project-id YOUR_PROJECT_ID
```
Then replace `src/lib/supabase/database.types.ts`.

## Build Phases

1. Scaffolding (DONE)
2. DB Schema + migrations
3. Auth + role-based access
4. Job posting + candidate profiles
5. AI matching engine
6. Cover letter generation
7. Search + filters
8. Monetization hooks
9. Testing + hardening
10. Deployment + launch
