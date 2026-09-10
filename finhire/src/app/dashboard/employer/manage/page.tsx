import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDate, formatSalary } from '@/lib/utils';

type JobWithCounts = {
  id: string;
  title: string;
  description: string;
  status: string;
  employment_type: string;
  location: string | null;
  location_type: string;
  salary_min: number | null;
  salary_max: number | null;
  seniority: string | null;
  created_at: string;
  application_count?: number;
};

export default async function EmployerManageJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verify employer
  const { data: employer }: { data: any } = await (supabase as any)
    .from('employers')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!employer) redirect('/dashboard/employer');

  // Fetch employer's jobs
  const { data: jobs, error }: { data: JobWithCounts[] | null; error: any } = await (supabase as any)
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('employer_id', employer.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-sm text-red-600">Failed to load jobs: {error.message}</p>
      </div>
    );
  }

  const jobList = jobs ?? [];

  // Get application counts per job
  if (jobList.length > 0) {
    const jobIds = jobList.map((j) => j.id);
    const { data: countRows }: { data: any[] | null } = await (supabase as any)
      .from('applications')
      .select('job_id')
      .in('job_id', jobIds);

    const counts: Record<string, number> = {};
    countRows?.forEach((row) => {
      counts[row.job_id] = (counts[row.job_id] ?? 0) + 1;
    });

    jobList.forEach((job) => {
      job.application_count = counts[job.id] ?? 0;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">
            {jobList.length} job{jobList.length !== 1 ? 's' : ''} posted
          </p>
        </div>
        <Link href="/post-job">
          <Button>Post a Job</Button>
        </Link>
      </div>

      {jobList.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500 py-8 text-center">
            You haven&apos;t posted any jobs yet.{' '}
            <Link href="/post-job" className="text-teal-700 font-medium hover:underline">
              Post your first job
            </Link>
            .
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobList.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: JobWithCounts }) {
  const statusVariant: Record<string, string> = {
    draft: 'slate',
    active: 'teal',
    closed: 'default',
  };

  const isActive = job.status === 'active';
  const employmentLabel = job.employment_type.replace('-', ' ');

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
            <Badge variant={(statusVariant as Record<string, string>)[job.status] as any ?? 'default'}>
              {job.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="capitalize">{employmentLabel}</span>
            <span>{job.location ?? 'Location not set'}</span>
            <span>Posted {formatDate(job.created_at)}</span>
          </div>
          {job.salary_min || job.salary_max ? (
            <p className="text-sm text-slate-500 mt-2">
              {formatSalary(job.salary_min, job.salary_max)}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{job.application_count ?? 0}</p>
            <p className="text-xs text-slate-400">applications</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href={`/jobs/${job.id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
            <form action={async () => {
              'use server';
              await deleteJob(job.id);
            }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                type="submit"
              >
                Delete
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Card>
  );
}

async function deleteJob(jobId: string) {
  'use server';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify the user owns this job
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

  // Hard delete — applications cascade or are removed
  const { error } = await (supabase as any)
    .from('jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    throw new Error(error.message);
  }
}
