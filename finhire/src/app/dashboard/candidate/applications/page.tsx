import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'teal' | 'gold' | 'slate' }
> = {
  pending: { label: 'Pending', variant: 'slate' },
  reviewed: { label: 'Reviewed', variant: 'default' },
  interviewing: { label: 'Interviewing', variant: 'gold' },
  offered: { label: 'Offered', variant: 'teal' },
  rejected: { label: 'Rejected', variant: 'slate' },
};

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: candidate }: { data: any } = await (supabase as any)
    .from('candidates')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!candidate) redirect('/onboarding/candidate');

  const { data: applications }: { data: any } = await (supabase as any)
    .from('applications')
    .select('*, jobs(*, organizations(name))')
    .eq('candidate_id', candidate.id)
    .order('applied_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Applications</h1>

      {!applications || applications.length === 0 ? (
        <Card>
          <p className="text-slate-500 text-center py-8">
            You haven&apos;t applied to any jobs yet.
          </p>
          <div className="text-center mt-4">
            <Link href="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app: any) => {
            const job = app.jobs;
            const org = job?.organizations;
            const status = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;

            return (
              <Card
                key={app.id}
                className="hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/jobs/${job?.id}`}>
                      <h3 className="font-semibold text-teal-700 hover:text-teal-800">
                        {job?.title ?? 'Unknown Job'}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-500 mt-1">
                      {org?.name ?? 'Unknown Company'}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="text-xs text-slate-400">
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                    {app.cover_letter && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {app.cover_letter}
                      </p>
                    )}
                  </div>
                  <Link href={`/jobs/${job?.id}`}>
                    <Button variant="ghost" size="sm">
                      View Job
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
