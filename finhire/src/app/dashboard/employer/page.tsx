import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmployerDashboardClient from './employer-dashboard';

export default async function EmployerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: employer }: { data: any } = await (supabase as any)
    .from('employers')
    .select('*, profiles!inner(*), organizations(*)')
    .eq('profile_id', user.id)
    .single();

  if (!employer) redirect('/onboarding/employer');

  return <EmployerDashboardClient employer={employer} />;
}
