import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingForm } from '../onboarding-form';

export default async function EmployerOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if already onboarded
  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (employer) {
    redirect('/dashboard/employer');
  }

  return <OnboardingForm userId={user.id} mode="employer" />;
}
