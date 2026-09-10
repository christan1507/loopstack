import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ApplyForm from './apply-form';

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/jobs/${id}/apply`);

  // Check if user is a candidate
  const { data: candidate }: { data: any } = await (supabase as any)
    .from('candidates')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!candidate) {
    redirect('/onboarding/candidate');
  }

  // Fetch job
  const { data: job }: { data: any } = await (supabase as any)
    .from('jobs')
    .select('*, organizations(name)')
    .eq('id', id)
    .single();

  if (!job) notFound();

  // Check for existing application
  const { data: existing }: { data: any } = await (supabase as any)
    .from('applications')
    .select('id, status')
    .eq('job_id', id)
    .eq('candidate_id', candidate.id)
    .maybeSingle();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Apply: {job.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {job.organizations?.name}
        </p>
      </div>

      {existing ? (
        <Card>
          <div className="text-center py-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              You&apos;ve already applied
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Your application status: <span className="font-medium capitalize">{existing.status}</span>
            </p>
            <div className="flex gap-3 justify-center">
              <Button href="/dashboard/candidate/applications" variant="outline">
                View Applications
              </Button>
              <Button href={`/jobs/${job.id}`} variant="secondary">
                Back to Job
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <ApplyForm jobId={job.id} jobTitle={job.title} candidateId={candidate.id} />
      )}
    </div>
  );
}
