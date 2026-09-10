import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q') || '';
  const location_type = searchParams.get('location_type') || '';
  const employment_type = searchParams.get('employment_type') || '';
  const seniority = searchParams.get('seniority') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 50);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let query = (supabase as any)
    .from('jobs')
    .select('*, organizations(*), job_skills(skill:skills(*))', { count: 'exact' })
    .eq('status', 'active')
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }
  if (location_type) {
    query = query.eq('location_type', location_type);
  }
  if (employment_type) {
    query = query.eq('employment_type', employment_type);
  }
  if (seniority) {
    query = query.eq('seniority', seniority);
  }

  const { data: jobs, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    jobs: jobs || [],
    total: count || 0,
    limit,
    offset,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user is an employer
  const { data: employer }: { data: any } = await (supabase as any)
    .from('employers')
    .select('id, organization_id')
    .eq('profile_id', user.id)
    .single();

  if (!employer) {
    return NextResponse.json({ error: 'Not an employer' }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, employment_type, seniority, location, location_type, salary_min, salary_max, requirements, skills } = body;

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
  }

  // Create job
  const { data: job, error: jobError }: { data: any; error: any } = await (supabase as any)
    .from('jobs')
    .insert({
      title,
      description,
      employment_type: employment_type || 'full-time',
      seniority: seniority || null,
      location: location || null,
      location_type: location_type || 'onsite',
      salary_min: salary_min || null,
      salary_max: salary_max || null,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      organization_id: employer.organization_id,
      employer_id: employer.id,
      status: 'active',
      is_paid: false,
      featured_until: null,
    })
    .select()
    .single();

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 });
  }

  // Create job_skills entries
  if (skills && Array.isArray(skills) && skills.length > 0) {
    for (const skillName of skills) {
      const normalized = skillName.trim().toLowerCase();
      if (!normalized) continue;

      // Find or create skill
      const { data: existingSkill }: { data: any } = await (supabase as any)
        .from('skills')
        .select('id')
        .eq('name', normalized)
        .single();

      let skillId = existingSkill?.id;

      if (!skillId) {
        const { data: newSkill, error: skillError }: { data: any; error: any } = await (supabase as any)
          .from('skills')
          .insert({ name: normalized })
          .select('id')
          .single();

        if (skillError) continue;
        skillId = newSkill?.id;
      }

      // Link skill to job
      await (supabase as any).from('job_skills').insert({
        job_id: job.id,
        skill_id: skillId,
        required: true,
      });
    }
  }

  return NextResponse.json({ job }, { status: 201 });
}
