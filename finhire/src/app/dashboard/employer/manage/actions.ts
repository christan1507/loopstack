'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteJob(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: job }: { data: any } = await (supabase as any)
    .from('jobs')
    .select('employer_id')
    .eq('id', jobId)
    .single();

  if (!job) {
    throw new Error('Job not found');
  }

  const { data: employer }: { data: any } = await (supabase as any)
    .from('employers')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!employer || job.employer_id !== employer.id) {
    throw new Error('Not authorized to delete this job');
  }

  const { error } = await (supabase as any).from('jobs').delete().eq('id', jobId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/employer/manage');
  revalidatePath('/jobs');
}
