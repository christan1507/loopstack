import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { JobCard } from '@/components/job-card/job-card';

type SearchParams = Record<string, string | string[] | undefined>;

async function getJobs(params: SearchParams) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const q = typeof params.q === 'string' ? params.q : params.q?.[0] || '';
  const locationType = typeof params.location_type === 'string' ? params.location_type : params.location_type?.[0] || '';
  const employmentType = typeof params.employment_type === 'string' ? params.employment_type : params.employment_type?.[0] || '';
  const seniority = typeof params.seniority === 'string' ? params.seniority : params.seniority?.[0] || '';
  const page = parseInt(typeof params.page === 'string' ? params.page : params.page?.[0] || '1', 10);
  const limit = 12;

  const qs = new URLSearchParams({
    q,
    location_type: locationType,
    employment_type: employmentType,
    seniority,
    limit: String(limit),
    offset: String((page - 1) * limit),
  });

  const res = await fetch(`${base}/api/jobs?${qs}`, {
    next: { revalidate: 30 },
  });
  const data = await res.json();

  return { jobs: data.jobs || [], total: data.total || 0, page, limit };
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { jobs, total, page, limit } = await getJobs(params);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const currentSearch = typeof params.q === 'string' ? params.q : params.q?.[0] || '';
  const currentLocation = typeof params.location_type === 'string' ? params.location_type : params.location_type?.[0] || '';
  const currentEmployment = typeof params.employment_type === 'string' ? params.employment_type : params.employment_type?.[0] || '';
  const currentSeniority = typeof params.seniority === 'string' ? params.seniority : params.seniority?.[0] || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Filters</h2>
              <form method="GET" className="space-y-4">
                <Input
                  name="q"
                  label="Search"
                  placeholder="Title or keyword…"
                  defaultValue={currentSearch}
                />
                <Select
                  name="location_type"
                  label="Work Mode"
                  defaultValue={currentLocation}
                >
                  <option value="">All modes</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </Select>
                <Select
                  name="employment_type"
                  label="Employment Type"
                  defaultValue={currentEmployment}
                >
                  <option value="">All types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </Select>
                <Select
                  name="seniority"
                  label="Seniority"
                  defaultValue={currentSeniority}
                >
                  <option value="">All levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead / Principal</option>
                  <option value="executive">Executive</option>
                </Select>
                <Button type="submit" size="sm" className="w-full">Apply Filters</Button>
              </form>
            </div>
          </div>
        </aside>

        {/* Job listing */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Open Positions</h1>
            <span className="text-sm text-slate-500">{total} {total === 1 ? 'job' : 'jobs'}</span>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <p className="text-slate-500 text-center py-8">No jobs found. Try adjusting your filters.</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job: any) => (
                  <JobCard job={job} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <PaginationLink params={params} page={page} direction="prev" disabled={page <= 1} />
                  <span className="text-sm text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <PaginationLink params={params} page={page} direction="next" disabled={page >= totalPages} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PaginationLink({
  params,
  page,
  direction,
  disabled,
}: {
  params: SearchParams;
  page: number;
  direction: 'prev' | 'next';
  disabled: boolean;
}) {
  const nextPage = direction === 'next' ? page + 1 : page - 1;

  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    const value = typeof v === 'string' ? v : v?.[0];
    if (value) qs.set(k, value);
  });
  qs.set('page', String(nextPage));

  const label = direction === 'prev' ? '← Previous' : 'Next →';

  if (disabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        {label}
      </Button>
    );
  }
  return (
    <a
      href={`?${qs.toString()}`}
      className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
    >
      {label}
    </a>
  );
}
