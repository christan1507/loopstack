import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user is a candidate
  const { data: candidate }: { data: any } = await (supabase as any)
    .from('candidates')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!candidate) {
    return NextResponse.json({ error: 'Only candidates can apply' }, { status: 403 });
  }

  const body = await request.json();
  const { job_id, cover_letter } = body;

  if (!job_id) {
    return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
  }

  // Verify job exists and is active
  const { data: job, error: jobError }: { data: any; error: any } = await (supabase as any)
    .from('jobs')
    .select('id, status, employer_id')
    .eq('id', job_id)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status !== 'active') {
    return NextResponse.json({ error: 'This job is not accepting applications' }, { status: 400 });
  }

  // Check for duplicate application
  const { data: existing }: { data: any | null } = await (supabase as any)
    .from('applications')
    .select('id')
    .eq('job_id', job_id)
    .eq('candidate_id', candidate.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'You have already applied for this job' },
      { status: 409 }
    );
  }

  // Create application
  const { data: application, error: appError }: { data: any; error: any } = await (supabase as any)
    .from('applications')
    .insert({
      job_id,
      candidate_id: candidate.id,
      cover_letter: cover_letter ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (appError) {
    return NextResponse.json({ error: appError.message }, { status: 500 });
  }

  return NextResponse.json({ application }, { status: 201 });
}
