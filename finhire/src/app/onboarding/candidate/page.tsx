import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingForm } from '../onboarding-form';

export default async function CandidateOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if already onboarded
  const { data: candidate } = await supabase
    .from('candidates')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (candidate) {
    redirect('/dashboard/candidate');
  }

  return <OnboardingForm userId={user.id} mode="candidate" />;
}
