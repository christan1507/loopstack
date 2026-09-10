import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');

  if (!jobId) {
    return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
  }

  // Fetch the job with its required skills
  const { data: job, error: jobError }: { data: any; error: any } = await (supabase as any)
    .from('jobs')
    .select('id, title, requirements')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Fetch all candidates with their profiles and skills
  const { data: candidates, error: candidatesError }: { data: any[] | null; error: any } =
    await (supabase as any)
      .from('candidates')
      .select(
        `
        id, headline, location, years_experience, is_premium,
        profiles ( id, full_name, email, avatar_url ),
        candidate_skills (
          skills ( id, name, category )
        )
      `
      );

  if (candidatesError) {
    return NextResponse.json({ error: candidatesError.message }, { status: 500 });
  }

  const requiredSkills: string[] = (job.requirements ?? [])
    .map((r: string) => r.trim().toLowerCase())
    .filter(Boolean);

  const results = (candidates ?? []).map((candidate) => {
    const candidateSkills: string[] = (candidate.candidate_skills ?? [])
      .filter((cs: any) => cs.skills)
      .map((cs: any) => (cs.skills.name as string).toLowerCase());

    const matched: string[] = [];
    const gaps: string[] = [];

    for (const req of requiredSkills) {
      if (candidateSkills.some((s) => s === req)) {
        matched.push(req);
      } else {
        gaps.push(req);
      }
    }

    const score =
      requiredSkills.length > 0
        ? Math.round((matched.length / requiredSkills.length) * 100)
        : 0;

    return {
      candidate: {
        id: candidate.id,
        headline: candidate.headline,
        location: candidate.location,
        years_experience: candidate.years_experience,
        is_premium: candidate.is_premium,
        profiles: candidate.profiles,
        skills: candidate.candidate_skills
          ?.filter((cs: any) => cs.skills)
          .map((cs: any) => cs.skills.name),
      },
      score,
      explanation: buildExplanation(score, matched, gaps, requiredSkills.length),
      matched_skills: matched,
      gaps,
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    job: { id: job.id, title: job.title },
    matches: results,
  });
}

function buildExplanation(score: number, matched: string[], gaps: string[], total: number): string {
  if (total === 0) {
    return 'No specific skills required for this role.';
  }

  if (score >= 80) {
    return `Strong match — covers ${matched.length}/${total} required skills.`;
  }
  if (score >= 50) {
    const gapList = gaps.length > 0 ? ` Missing: ${gaps.join(', ')}.` : '';
    return `Partial match — covers ${matched.length}/${total} required skills.${gapList}`;
  }
  if (score > 0) {
    return `Weak match — only ${matched.length}/${total} required skills covered.`;
  }
  return 'No required skills matched. Consider candidates with complementary backgrounds.';
}
