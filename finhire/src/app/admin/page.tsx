import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type AdminStats = {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  recentUsers: Array<{
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    created_at: string;
  }>;
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    employment_type: string;
    created_at: string;
  }>;
};

const ROLE_COLORS: Record<string, string> = {
  employer: 'teal',
  candidate: 'gold',
  admin: 'slate',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'slate',
  active: 'teal',
  closed: 'default',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Check admin role
  const { data: profile }: { data: any } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // Fetch stats
  const [
    { count: userCount },
    { count: jobCount },
    { count: applicationCount },
    { data: recentUsers },
    { data: recentJobs },
  ] = await Promise.all([
    (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
    (supabase as any).from('jobs').select('*', { count: 'exact', head: true }),
    (supabase as any).from('applications').select('*', { count: 'exact', head: true }),
    (supabase as any)
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    (supabase as any)
      .from('jobs')
      .select('id, title, status, employment_type, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const stats: AdminStats = {
    totalUsers: userCount ?? 0,
    totalJobs: jobCount ?? 0,
    totalApplications: applicationCount ?? 0,
    recentUsers: recentUsers ?? [],
    recentJobs: recentJobs ?? [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of platform activity and content.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={String(stats.totalUsers)} />
        <StatCard label="Total Jobs" value={String(stats.totalJobs)} />
        <StatCard label="Total Applications" value={String(stats.totalApplications)} />
      </div>

      {/* Recent Users */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Users</h2>
        {stats.recentUsers.length === 0 ? (
          <p className="text-sm text-slate-500">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Name</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 px-3 text-slate-900">
                      {u.full_name ?? '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={(ROLE_COLORS[u.role] ?? 'default') as any}>{u.role}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent Jobs */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Jobs</h2>
        {stats.recentJobs.length === 0 ? (
          <p className="text-sm text-slate-500">No jobs posted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Title</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Posted</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentJobs.map((job) => (
                  <tr key={job.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 px-3 text-slate-900">{job.title}</td>
                    <td className="py-2.5 px-3 text-slate-600 capitalize">
                      {job.employment_type?.replace('-', ' ')}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={(STATUS_COLORS[job.status] ?? 'default') as any}>{job.status}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
