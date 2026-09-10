'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatSalary, relativeTime } from '@/lib/utils';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    location: string | null;
    location_type: 'remote' | 'hybrid' | 'onsite';
    salary_min: number | null;
    salary_max: number | null;
    employment_type: string;
    seniority: string | null;
    status: string;
    featured_until: string | null;
    created_at: string;
    organizations: { name: string };
    job_skills: Array<{ skill: { name: string; category: string } }>;
  };
}

export function JobCard({ job }: JobCardProps) {
  const skills = (job.job_skills || []).slice(0, 3);

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card hoverable className="h-full">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{job.title}</h3>
          {job.featured_until && new Date(job.featured_until) > new Date() && (
            <Badge variant="gold">Featured</Badge>
          )}
        </div>

        <p className="text-sm text-slate-500 mb-3">
          {job.organizations?.name}
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-slate-600">
          <span className="truncate">{job.location || 'Location TBD'}</span>
          <span className="text-slate-300">|</span>
          <Badge variant="teal" className="capitalize">{job.location_type}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="default" className="capitalize">{job.employment_type}</Badge>
          {job.seniority && (
            <Badge variant="slate" className="capitalize">{job.seniority}</Badge>
          )}
          <span className="text-sm font-medium text-slate-700 ml-auto">
            {formatSalary(job.salary_min, job.salary_max)}
          </span>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skills.map((js) => (
              <Badge key={js.skill.name} variant="slate" className="text-xs">
                {js.skill.name}
              </Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400">
          {relativeTime(job.created_at)}
        </p>
      </Card>
    </Link>
  );
}
