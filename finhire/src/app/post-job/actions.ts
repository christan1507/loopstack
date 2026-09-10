'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createJob(data: {
  title: string;
  description: string;
  employment_type: string;
  seniority: string | null;
  location: string | null;
  location_type: string;
  salary_min: number | null;
  salary_max: number | null;
  requirements: string[];
  skills: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: employer }: { data: any } = await (supabase as any)
    .from('employers')
    .select('organization_id')
    .eq('profile_id', user.id)
    .single();

  if (!employer) {
    redirect('/onboarding/employer');
  }

  // Create job
  const { data: job, error: jobError }: { data: any; error: any } = await (supabase as any)
    .from('jobs')
    .insert({
      title: data.title,
      description: data.description,
      employment_type: data.employment_type || 'full-time',
      seniority: data.seniority,
      location: data.location,
      location_type: data.location_type || 'onsite',
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      requirements: data.requirements,
      organization_id: employer.organization_id,
      employer_id: employer.id,
      status: 'active',
      is_paid: false,
      featured_until: null,
    })
    .select()
    .single();

  if (jobError || !job) {
    return { error: jobError?.message || 'Failed to create job' };
  }

  // Create job_skills entries
  if (data.skills.length > 0) {
    for (const skillName of data.skills) {
      const normalized = skillName.trim().toLowerCase();
      if (!normalized) continue;

      // Find or create skill
      const { data: existingSkill }: { data: any } = await (supabase as any)
        .from('skills')
        .select('id')
        .eq('name', normalized)
        .single();

      let skillId = existingSkill?.id;

      if (!skillId) {
        const { data: newSkill, error: skillError }: { data: any; error: any } = await (supabase as any)
          .from('skills')
          .insert({ name: normalized })
          .select('id')
          .single();

        if (skillError) continue;
        skillId = newSkill?.id;
      }

      // Link skill to job
      await (supabase as any).from('job_skills').insert({
        job_id: job.id,
        skill_id: skillId,
        required: true,
      });
    }
  }

  revalidatePath('/jobs');
  redirect('/dashboard/employer');
}
