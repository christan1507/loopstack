-- ============================================================
-- FinHire — Phase 2: Database Schema
-- Tables: profiles, organizations, employers, candidates,
--         skills, candidate_skills, projects, certifications,
--         jobs, job_skills, applications, matches, messages
-- ============================================================

-- ─── Extensions ────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ─── Enums ─────────────────────────────────────────────────
create type user_role as enum ('employer', 'candidate', 'admin');
create type job_status as enum ('draft', 'active', 'closed');
create type employment_type as enum ('full-time', 'part-time', 'contract', 'internship');
create type location_type as enum ('remote', 'hybrid', 'onsite');
create type application_status as enum ('pending', 'reviewed', 'interviewing', 'offered', 'rejected');
create type skill_category as enum ('technical', 'domain', 'soft');
create type proficiency_level as enum ('beginner', 'intermediate', 'advanced', 'expert');

-- ─── profiles (extends auth.users) ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'candidate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles(email);
create index profiles_role_idx on public.profiles(role);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Public can view profiles"
  on public.profiles for select
  using (true);

-- ─── organizations ─────────────────────────────────────────
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  logo_url text,
  industry text,
  size text,
  description text,
  created_at timestamptz not null default now()
);

create index organizations_name_idx on public.organizations(name);

alter table public.organizations enable row level security;

create policy "Anyone can view organizations"
  on public.organizations for select
  using (true);

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.role() = 'authenticated');

create policy "Organization owners can update"
  on public.organizations for update
  using (
    exists (
      select 1 from public.employers e
      where e.organization_id = organizations.id
        and e.profile_id = auth.uid()
    )
  );

-- ─── employers ──────────────────────────────────────────────
create table public.employers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  constraint employers_profile_org_unique unique (profile_id, organization_id)
);

create index employers_profile_id_idx on public.employers(profile_id);
create index employers_organization_id_idx on public.employers(organization_id);

alter table public.employers enable row level security;

create policy "Employers view own record"
  on public.employers for select
  using (
    auth.uid() = profile_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Employers insert own record"
  on public.employers for insert
  with check (auth.uid() = profile_id);

create policy "Organization members update"
  on public.employers for update
  using (
    exists (
      select 1 from public.employers e2
      where e2.organization_id = employers.organization_id
        and e2.profile_id = auth.uid()
    )
  );

-- ─── candidates ─────────────────────────────────────────────
create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  headline text,
  location text,
  resume_url text,
  years_experience int,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint candidates_profile_unique unique (profile_id)
);

create index candidates_profile_id_idx on public.candidates(profile_id);
create index candidates_is_premium_idx on public.candidates(is_premium) where is_premium = true;

alter table public.candidates enable row level security;

create policy "Candidates view own record"
  on public.candidates for select
  using (
    auth.uid() = profile_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('employer', 'admin'))
  );

create policy "Candidates insert own record"
  on public.candidates for insert
  with check (auth.uid() = profile_id);

create policy "Candidates update own record"
  on public.candidates for update
  using (auth.uid() = profile_id);

-- ─── skills ─────────────────────────────────────────────────
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category skill_category not null default 'technical',
  created_at timestamptz not null default now()
);

create index skills_name_idx on public.skills(name);
create index skills_category_idx on public.skills(category);

alter table public.skills enable row level security;

create policy "Anyone can view skills"
  on public.skills for select
  using (true);

create policy "Authenticated users can create skills"
  on public.skills for insert
  with check (auth.role() = 'authenticated');

-- ─── candidate_skills ───────────────────────────────────────
create table public.candidate_skills (
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  proficiency proficiency_level not null default 'intermediate',
  created_at timestamptz not null default now(),
  primary key (candidate_id, skill_id)
);

create index candidate_skills_candidate_id_idx on public.candidate_skills(candidate_id);
create index candidate_skills_skill_id_idx on public.candidate_skills(skill_id);

alter table public.candidate_skills enable row level security;

create policy "Anyone can view candidate skills"
  on public.candidate_skills for select
  using (true);

create policy "Candidates manage own skills"
  on public.candidate_skills for all
  using (
    exists (
      select 1 from public.candidates c
      where c.id = candidate_skills.candidate_id
        and c.profile_id = auth.uid()
    )
  );

-- ─── projects ───────────────────────────────────────────────
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  name text not null,
  description text,
  url text,
  tech_stack text[] default '{}',
  created_at timestamptz not null default now()
);

create index projects_candidate_id_idx on public.projects(candidate_id);

alter table public.projects enable row level security;

create policy "Anyone can view projects"
  on public.projects for select
  using (true);

create policy "Candidates manage own projects"
  on public.projects for all
  using (
    exists (
      select 1 from public.candidates c
      where c.id = projects.candidate_id
        and c.profile_id = auth.uid()
    )
  );

-- ─── certifications ────────────────────────────────────────
create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  name text not null,
  issuer text,
  issue_date date,
  expiry_date date,
  created_at timestamptz not null default now()
);

create index certifications_candidate_id_idx on public.certifications(candidate_id);

alter table public.certifications enable row level security;

create policy "Anyone can view certifications"
  on public.certifications for select
  using (true);

create policy "Candidates manage own certifications"
  on public.certifications for all
  using (
    exists (
      select 1 from public.candidates c
      where c.id = certifications.candidate_id
        and c.profile_id = auth.uid()
    )
  );

-- ─── jobs ───────────────────────────────────────────────────
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  requirements text[] default '{}',
  location text,
  location_type location_type not null default 'hybrid',
  salary_min int,
  salary_max int,
  employment_type employment_type not null default 'full-time',
  seniority text,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employer_id uuid not null references public.profiles(id) on delete cascade,
  status job_status not null default 'draft',
  is_paid boolean not null default false,
  featured_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_status_idx on public.jobs(status);
create index jobs_organization_id_idx on public.jobs(organization_id);
create index jobs_employer_id_idx on public.jobs(employer_id);
create index jobs_featured_idx on public.jobs(featured_until) where featured_until > now() and status = 'active';
create index jobs_salary_idx on public.jobs(salary_min, salary_max) where status = 'active';

alter table public.jobs enable row level security;

create policy "Anyone can view active jobs"
  on public.jobs for select
  using (status = 'active'
    or auth.uid() = employer_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Employers can create jobs"
  on public.jobs for insert
  with check (auth.uid() = employer_id);

create policy "Employers can update own jobs"
  on public.jobs for update
  using (auth.uid() = employer_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─── job_skills ─────────────────────────────────────────────
create table public.job_skills (
  job_id uuid not null references public.jobs(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  required boolean not null default true,
  primary key (job_id, skill_id)
);

create index job_skills_job_id_idx on public.job_skills(job_id);
create index job_skills_skill_id_idx on public.job_skills(skill_id);

alter table public.job_skills enable row level security;

create policy "Anyone can view job skills"
  on public.job_skills for select
  using (true);

create policy "Employers manage own job skills"
  on public.job_skills for all
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_skills.job_id
        and j.employer_id = auth.uid()
    )
  );

-- ─── applications ───────────────────────────────────────────
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  status application_status not null default 'pending',
  cover_letter text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_job_candidate_unique unique (job_id, candidate_id)
);

create index applications_job_id_idx on public.applications(job_id);
create index applications_candidate_id_idx on public.applications(candidate_id);
create index applications_status_idx on public.applications(status);

alter table public.applications enable row level security;

create policy "Candidates view own applications"
  on public.applications for select
  using (
    auth.uid() = candidate_id
    or exists (
      select 1 from public.jobs j
      where j.id = applications.job_id
        and j.employer_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Candidates create applications"
  on public.applications for insert
  with check (auth.uid() = candidate_id);

create policy "Employers update application status"
  on public.applications for update
  using (
    exists (
      select 1 from public.jobs j
      where j.id = applications.job_id
        and j.employer_id = auth.uid()
    )
  );

-- ─── matches ────────────────────────────────────────────────
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  score int not null check (score >= 0 and score <= 100),
  explanation text,
  matched_skills text[] default '{}',
  gaps text[] default '{}',
  matched_at timestamptz not null default now(),
  constraint matches_job_candidate_unique unique (job_id, candidate_id)
);

create index matches_job_id_idx on public.matches(job_id);
create index matches_candidate_id_idx on public.matches(candidate_id);
create index matches_score_idx on public.matches(score desc);

alter table public.matches enable row level security;

create policy "Employers view matches for own jobs"
  on public.matches for select
  using (
    exists (
      select 1 from public.jobs j
      where j.id = matches.job_id
        and j.employer_id = auth.uid()
    )
    or exists (
      select 1 from public.candidates c
      where c.id = matches.candidate_id
        and c.profile_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "System can insert matches"
  on public.matches for insert
  with check (true);

-- ─── messages ───────────────────────────────────────────────
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index messages_application_id_idx on public.messages(application_id);
create index messages_sender_id_idx on public.messages(sender_id);

alter table public.messages enable row level security;

create policy "Participants view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.applications a
      where a.id = messages.application_id
        and (a.candidate_id = auth.uid()
          or exists (
            select 1 from public.jobs j
            where j.id = a.job_id and j.employer_id = auth.uid()
          )
        )
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Participants send messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.applications a
      where a.id = messages.application_id
        and (a.candidate_id = auth.uid()
          or exists (
            select 1 from public.jobs j
            where j.id = a.job_id and j.employer_id = auth.uid()
          )
        )
    )
  );

-- ─── Updated-at triggers ────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger candidates_updated_at
  before update on public.candidates
  for each row execute function public.handle_updated_at();

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute function public.handle_updated_at();

create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.handle_updated_at();

-- ─── Seed skills ────────────────────────────────────────────
insert into public.skills (name, category) values
  -- Technical / ML
  ('Python', 'technical'),
  ('R', 'technical'),
  ('SQL', 'technical'),
  ('TensorFlow', 'technical'),
  ('PyTorch', 'technical'),
  ('C++', 'technical'),
  ('Java', 'technical'),
  ('Scala', 'technical'),
  ('Julia', 'technical'),
  ('MATLAB', 'technical'),
  ('Kubernetes', 'technical'),
  ('Docker', 'technical'),
  ('AWS', 'technical'),
  ('Azure ML', 'technical'),
  ('Spark', 'technical'),
  ('Hadoop', 'technical'),
  -- Domain / Finance
  ('Quantitative Finance', 'domain'),
  ('Risk Modeling', 'domain'),
  ('Algorithmic Trading', 'domain'),
  ('Portfolio Management', 'domain'),
  ('Financial Modeling', 'domain'),
  ('Derivatives Pricing', 'domain'),
  ('Credit Scoring', 'domain'),
  ('Fraud Detection', 'domain'),
  ('Regulatory Compliance (AI)', 'domain'),
  ('Explainable AI', 'domain'),
  ('Stress Testing', 'domain'),
  ('AML/KYC', 'domain'),
  ('Solvency II', 'domain'),
  -- Soft
  ('Stakeholder Communication', 'soft'),
  ('Cross-functional Leadership', 'soft'),
  ('Technical Writing', 'soft'),
  ('Data Storytelling', 'soft')
on conflict (name) do nothing;
