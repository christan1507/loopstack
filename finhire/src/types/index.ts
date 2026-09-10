// Plain TypeScript types for all FinHire entities.
// Replace with `npx supabase gen types typescript --project-id YOUR_PROJECT_ID`
// for full Supabase client type coverage after applying migrations.

export type UserRole = 'employer' | 'candidate' | 'admin';

export type JobStatus = 'draft' | 'active' | 'closed';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export type LocationType = 'remote' | 'hybrid' | 'onsite';

export type ApplicationStatus = 'pending' | 'reviewed' | 'interviewing' | 'offered' | 'rejected';

export type SkillCategory = 'technical' | 'domain' | 'soft';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  website: string | null;
  logo_url: string | null;
  industry: string | null;
  size: string | null;
  description: string | null;
  created_at: string;
}

export interface Employer {
  id: string;
  profile_id: string;
  organization_id: string;
  title: string | null;
  created_at: string;
}

export interface Candidate {
  id: string;
  profile_id: string;
  headline: string | null;
  location: string | null;
  resume_url: string | null;
  years_experience: number | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  created_at: string;
}

export interface CandidateSkill {
  candidate_id: string;
  skill_id: string;
  proficiency: ProficiencyLevel;
  created_at: string;
}

export interface Project {
  id: string;
  candidate_id: string;
  name: string;
  description: string | null;
  url: string | null;
  tech_stack: string[];
  created_at: string;
}

export interface Certification {
  id: string;
  candidate_id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  location: string | null;
  location_type: LocationType;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: EmploymentType;
  seniority: string | null;
  organization_id: string;
  employer_id: string;
  status: JobStatus;
  is_paid: boolean;
  featured_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobSkill {
  job_id: string;
  skill_id: string;
  required: boolean;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  applied_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  job_id: string;
  candidate_id: string;
  score: number;
  explanation: string | null;
  matched_skills: string[];
  gaps: string[];
  matched_at: string;
}

export interface Message {
  id: string;
  application_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
