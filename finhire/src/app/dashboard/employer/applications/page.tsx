import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatSalary, formatDate, relativeTime, cn } from '@/lib/utils';

type ApplicationWithDetails = {
  id: string;
  status: string;
  cover_letter: string | null;
  applied_at: string;
  updated_at: string;
  jobs: {
    id: string;
    title: string;
    status: string;
    employment_type: string;
    location: string | null;
  } | null;
  candidates: {
    id: string;
    headline: string | null;
    location: string | null;
    years_experience: number | null;
    resume_url: string | null;
    profiles: {
      id: string;
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  } | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'default',
  reviewed: 'teal',
  interviewing: 'gold',
  offered: 'teal',
  rejected: 'slate',
};

function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_COLORS[status] ?? 'default';
  return (
    <Badge variant={variant as any}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default async function EmployerApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verify employer
  const { data: employer }: { data: any } = await (supabase as any)
    .from('employers')
    .select('id, profile_id')
    .eq('profile_id', user.id)
    .single();

  if (!employer) redirect('/dashboard/employer');

  // Get all jobs posted by this employer
  const { data: jobs }: { data: any } = await (supabase as any)
    .from('jobs')
    .select('id')
    .eq('employer_id', employer.id);

  const jobIds = jobs?.map((j: any) => j.id) ?? [];

  if (jobIds.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Applications</h1>
        <p className="text-slate-500 mt-4">No jobs posted yet. Post a job to start receiving applications.</p>
      </div>
    );
  }

  // Fetch applications for these jobs with job and candidate details
  const { data: applications }: { data: ApplicationWithDetails[] | null } = await (supabase as any)
    .from('applications')
    .select(
      `
      id, status, cover_letter, applied_at, updated_at,
      jobs!inner ( id, title, status, employment_type, location ),
      candidates!inner (
        id, headline, location, years_experience, resume_url,
        profiles!inner ( id, full_name, email, avatar_url )
      )
    `
    )
    .in('job_id', jobIds)
    .order('applied_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Applications</h1>
      <p className="text-sm text-slate-500 mb-8">
        {applications?.length ?? 0} application{(applications?.length ?? 0) !== 1 ? 's' : ''} received
      </p>

      {(!applications || applications.length === 0) ? (
        <Card>
          <p className="text-sm text-slate-500 py-8 text-center">
            No applications received yet. Share your jobs to attract candidates.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const candidateName =
              app.candidates?.profiles?.full_name ?? app.candidates?.profiles?.email ?? 'Unknown Candidate';
            const jobTitle = app.jobs?.title ?? 'Unknown Job';

            return (
              <Card key={app.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{candidateName}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Applied for <span className="font-medium">{jobTitle}</span>
                    </p>
                    {app.candidates?.headline && (
                      <p className="text-sm text-slate-500 mb-1">{app.candidates.headline}</p>
                    )}
                    {app.cover_letter && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        &ldquo;{app.cover_letter.slice(0, 200)}
                        {app.cover_letter.length > 200 ? '...' : ''}&rdquo;
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
                      <span>Applied {relativeTime(app.applied_at)}</span>
                      {app.candidates?.location && <span>{app.candidates.location}</span>}
                      {app.candidates?.years_experience != null && (
                        <span>{app.candidates.years_experience}yr exp</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    {app.candidates?.profiles?.id && (
                      <a
                        href={`/candidates/${app.candidates.profiles.id}`}
                        className="text-sm text-teal-700 hover:text-teal-800 font-medium"
                      >
                        View Profile
                      </a>
                    )}
                    <form action={async () => {
                      'use server';
                      await updateApplicationStatus(app.id, 'reviewed');
                    }}>
                      <select
                        name="status"
                        defaultValue={app.status}
                        className="text-xs rounded-lg border border-slate-300 px-2 py-1.5 bg-white"
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          if (newStatus !== app.status) {
                            await updateApplicationStatus(app.id, newStatus);
                          }
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

async function updateApplicationStatus(appId: string, status: string) {
  'use server';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validStatuses = ['pending', 'reviewed', 'interviewing', 'offered', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  const { error } = await (supabase as any)
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', appId);

  if (error) {
    throw new Error(error.message);
  }
}
