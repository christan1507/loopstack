'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EmployerDashboardProps {
  employer: {
    id: string;
    title: string | null;
    organizations: { name: string };
    profiles: { full_name: string | null; email: string };
  };
}

type Tab = 'overview' | 'applications' | 'manage';

export default function EmployerDashboardClient({ employer }: EmployerDashboardProps) {
  const orgName = employer.organizations?.name ?? 'Your Company';
  const employerName = employer.profiles?.full_name ?? employer.profiles?.email;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {employerName}&apos;s Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {orgName} — {employer.title || 'Team Member'}
          </p>
        </div>
        <Link href="/post-job">
          <Button>Post a Job</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/employer/manage">
          <StatCard label="Active Jobs" value="0" />
        </Link>
        <Link href="/dashboard/employer/applications">
          <StatCard label="Applications" value="0" />
        </Link>
        <Link href="/search">
          <StatCard label="Find Candidates" value="→" />
        </Link>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/post-job">
            <Button variant="outline" size="sm">+ Post New Job</Button>
          </Link>
          <Link href="/search">
            <Button variant="secondary" size="sm">Find Candidates</Button>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <p className="text-sm text-slate-500">
          Post your first job to start receiving applications.
        </p>
        <Link href="/post-job" className="inline-block mt-4">
          <Button size="sm">Post a Job</Button>
        </Link>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </Card>
  );
}
