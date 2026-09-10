import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PostJobForm from './post-job-form';

export default async function PostJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: employer }: { data: any } = await (supabase as any)
    .from('employers')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!employer) {
    redirect('/onboarding/employer');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Post a New Job</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a listing to find AI/ML/quant talent in finance
        </p>
      </div>

      <PostJobForm />
    </div>
  );
}
