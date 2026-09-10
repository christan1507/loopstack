import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileFormClient from './profile-form';

export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: candidate }: { data: any } = await (supabase as any)
    .from('candidates')
    .select('*, profiles!inner(*), candidate_skills(skill:skills(*)), projects(*), certifications(*)')
    .eq('profile_id', user.id)
    .single();

  if (!candidate) {
    redirect('/onboarding/candidate');
  }

  const profile = candidate.profiles;
  const skills = candidate.candidate_skills?.map((cs: any) => cs.skill).filter(Boolean) ?? [];
  const projects = candidate.projects ?? [];
  const certifications = candidate.certifications ?? [];

  return (
    <ProfileFormClient
      profileId={profile.id}
      fullName={profile.full_name ?? ''}
      headline={candidate.headline ?? ''}
      location={candidate.location ?? ''}
      yearsExperience={candidate.years_experience ?? null}
      skills={skills}
      projects={projects}
      certifications={certifications}
    />
  );
}
