import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatSalary, formatDate } from '@/lib/utils';

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: job }: { data: any } = await (supabase as any)
    .from('jobs')
    .select('*, organizations(*), job_skills(skill:skills(*))')
    .eq('id', params.id)
    .single();

  if (!job) {
    notFound();
  }

  const skills = (job.job_skills || [])
    .map((js: any) => js.skill?.name)
    .filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
            <p className="text-lg text-slate-600">
              {job.organizations?.name}
            </p>
          </div>
          <Link href={`/jobs/${job.id}/apply`}>
            <Button size="lg">Apply Now</Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Badge variant="default" className="capitalize">{job.employment_type}</Badge>
          {job.seniority && (
            <Badge variant="slate" className="capitalize">{job.seniority}</Badge>
          )}
          <Badge variant="teal" className="capitalize">{job.location_type}</Badge>
          <span className="text-sm font-medium text-slate-700">
            {formatSalary(job.salary_min, job.salary_max)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </div>
          </Card>

          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
                {job.requirements.map((req: string, i: number) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Details</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Location</dt>
                <dd className="text-slate-900 font-medium mt-0.5">
                  {job.location || 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Work Mode</dt>
                <dd className="mt-0.5">
                  <Badge variant="teal" className="capitalize">{job.location_type}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Employment Type</dt>
                <dd className="mt-0.5">
                  <Badge variant="default" className="capitalize">{job.employment_type}</Badge>
                </dd>
              </div>
              {job.seniority && (
                <div>
                  <dt className="text-slate-500">Seniority</dt>
                  <dd className="mt-0.5">
                    <Badge variant="slate" className="capitalize">{job.seniority}</Badge>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Salary</dt>
                <dd className="text-slate-900 font-medium mt-0.5">
                  {formatSalary(job.salary_min, job.salary_max)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Posted</dt>
                <dd className="text-slate-900 font-medium mt-0.5">
                  {formatDate(job.created_at)}
                </dd>
              </div>
            </dl>
          </Card>

          {skills.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <Badge key={skill} variant="slate">{skill}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
