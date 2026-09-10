import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CandidateDashboardClient from './candidate-dashboard';

export default async function CandidateDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: candidate }: { data: any } = await (supabase as any)
    .from('candidates')
    .select('*, profiles!inner(*), candidate_skills(skill:skills(*)), projects(*), certifications(*)')
    .eq('profile_id', user.id)
    .single();

  if (!candidate) redirect('/onboarding/candidate');

  return <CandidateDashboardClient candidate={candidate} />;
}
