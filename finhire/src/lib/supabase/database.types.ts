// Generated from Supabase schema.
// Replace with `npx supabase gen types typescript --project-id YOUR_PROJECT_ID`
// for full type coverage after applying migrations.

export type UserRole = 'employer' | 'candidate' | 'admin';
export type JobStatus = 'draft' | 'active' | 'closed';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type LocationType = 'remote' | 'hybrid' | 'onsite';
export type ApplicationStatus = 'pending' | 'reviewed' | 'interviewing' | 'offered' | 'rejected';
export type SkillCategory = 'technical' | 'domain' | 'soft';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Database {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      }
    >;
    Views: Record<string, { [key: string]: unknown }>;
    Functions: Record<string, (...args: unknown[]) => unknown>;
    Enums: Record<string, string>;
  };
}
