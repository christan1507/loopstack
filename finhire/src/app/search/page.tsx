import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type CandidateSearchResult = {
  id: string;
  headline: string | null;
  location: string | null;
  years_experience: number | null;
  is_premium: boolean;
  created_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  candidate_skills: Array<{
    skills: {
      id: string;
      name: string;
      category: string;
    } | null;
  }>;
};

export default async function SearchCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ skills?: string; location?: string; experience?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let candidates: CandidateSearchResult[] = [];
  let searched = false;

  if (params.skills || params.location) {
    searched = true;
    let query = (supabase as any)
      .from('candidates')
      .select(
        `
        id, headline, location, years_experience, is_premium, created_at,
        profiles!inner ( id, full_name, email, avatar_url ),
        candidate_skills (
          skills!inner ( id, name, category )
        )
      `
      );

    if (params.location) {
      query = query.ilike('location', `%${params.location}%`);
    }

    if (params.skills) {
      const skillNames = params.skills
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      if (skillNames.length > 0) {
        // Fetch skill IDs matching the names
        const { data: matchingSkills }: { data: any[] | null } = await (supabase as any)
          .from('skills')
          .select('id, name')
          .in('name', skillNames);

        const skillIds = matchingSkills?.map((s) => s.id) ?? [];

        if (skillIds.length > 0) {
          // Get candidate IDs that have at least one of the required skills
          const { data: candidateSkillRows }: { data: any[] | null } = await (supabase as any)
            .from('candidate_skills')
            .select('candidate_id')
            .in('skill_id', skillIds);

          const candidateIds = [
            ...new Set(candidateSkillRows?.map((r) => r.candidate_id) ?? []),
          ];

          if (candidateIds.length > 0) {
            query = query.in('id', candidateIds);
          } else {
            // No matches possible
            query = query.in('id', ['__none__']);
          }
        }
      }
    }

    if (params.experience) {
      const minExp = parseInt(params.experience, 10);
      if (!isNaN(minExp)) {
        query = query.gte('years_experience', minExp);
      }
    }

    const { data: results, error }: { data: CandidateSearchResult[] | null; error: any } = await query;

    if (error) {
      console.error('Search error:', error);
    }

    candidates = results ?? [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Find Candidates</h1>
      <p className="text-sm text-slate-500 mb-8">
        Search AI/ML/quant talent by skills, location, or experience.
      </p>

      {/* Search Form */}
      <Card className="mb-8">
        <form method="GET" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
            <input
              type="text"
              name="skills"
              defaultValue={params.skills || ''}
              placeholder="e.g. Python, ML, SQL"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              defaultValue={params.location || ''}
              placeholder="City or 'Remote'"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Min. Experience (years)
            </label>
            <input
              type="number"
              name="experience"
              defaultValue={params.experience || ''}
              placeholder="e.g. 3"
              min="0"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Results */}
      {searched && (
        <div className="mb-4">
          <p className="text-sm text-slate-500">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      {candidates.length === 0 && searched ? (
        <Card>
          <p className="text-sm text-slate-500 py-8 text-center">
            No candidates match your search. Try broadening your criteria.
          </p>
        </Card>
      ) : candidates.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate) => {
            const profile = candidate.profiles;
            const fullName = profile?.full_name ?? profile?.email ?? 'Candidate';
            const topSkills = (candidate.candidate_skills ?? [])
              .filter((cs: any) => cs.skills)
              .slice(0, 5)
              .map((cs: any) => cs.skills!.name);

            return (
              <Card key={candidate.id} hoverable className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-semibold text-sm shrink-0">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{fullName}</h3>
                    {candidate.headline && (
                      <p className="text-xs text-slate-500 truncate">{candidate.headline}</p>
                    )}
                  </div>
                </div>

                {topSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {topSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-block px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mb-4">
                  {candidate.location && <span>{candidate.location}</span>}
                  {candidate.years_experience != null && (
                    <span>{candidate.years_experience}yr exp</span>
                  )}
                  {candidate.is_premium && (
                    <Badge variant="gold">Premium</Badge>
                  )}
                </div>

                <Link
                  href={`/candidates/${candidate.id}`}
                  className="inline-block"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        !searched && (
          <Card>
            <p className="text-sm text-slate-500 py-8 text-center">
              Use the form above to search for candidates by skills, location, or experience level.
            </p>
          </Card>
        )
      )}
    </div>
  );
}
