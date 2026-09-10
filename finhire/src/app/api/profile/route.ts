import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type ProfileUpdateBody = {
  full_name?: string;
  headline?: string;
  location?: string;
  years_experience?: number | null;
  resume_url?: string | null;
  skills?: string[];
};

// GET current user profile
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch profile
  const { data: profile }: { data: any } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch candidate or employer data
  let candidateData: any = null;
  let employerData: any = null;

  const { data: cand }: { data: any } = await (supabase as any)
    .from('candidates')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (cand) candidateData = cand;

  const { data: emp }: { data: any } = await (supabase as any)
    .from('employers')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (emp) employerData = emp;

  // Fetch candidate skills if candidate
  let skills: any[] = [];
  if (candidateData) {
    const { data: skillRows }: { data: any[] | null } = await (supabase as any)
      .from('candidate_skills')
      .select('skill_id, proficiency, skills(name, category)')
      .eq('candidate_id', candidateData.id);

    skills = skillRows ?? [];
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: profile ?? {},
    candidate: candidateData,
    employer: employerData,
    skills,
  });
}

// PUT update current user profile
export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as ProfileUpdateBody;

  // Update profiles table
  const profileUpdates: Record<string, any> = {};
  if (body.full_name !== undefined) profileUpdates.full_name = body.full_name;

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await (supabase as any)
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  // Update candidate table if applicable
  const { data: candidate }: { data: any } = await (supabase as any)
    .from('candidates')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (candidate) {
    const candidateUpdates: Record<string, any> = {};
    if (body.headline !== undefined) candidateUpdates.headline = body.headline;
    if (body.location !== undefined) candidateUpdates.location = body.location;
    if (body.years_experience !== undefined) candidateUpdates.years_experience = body.years_experience;
    if (body.resume_url !== undefined) candidateUpdates.resume_url = body.resume_url;

    if (Object.keys(candidateUpdates).length > 0) {
      const { error: candError } = await (supabase as any)
        .from('candidates')
        .update(candidateUpdates)
        .eq('id', candidate.id);

      if (candError) {
        return NextResponse.json({ error: candError.message }, { status: 500 });
      }
    }

    // Update skills if provided
    if (Array.isArray(body.skills)) {
      // Remove existing candidate_skills
      await (supabase as any)
        .from('candidate_skills')
        .delete()
        .eq('candidate_id', candidate.id);

      // Find or create each skill and link
      for (const skillName of body.skills) {
        const normalized = skillName.trim().toLowerCase();
        if (!normalized) continue;

        const { data: existingSkill }: { data: any } = await (supabase as any)
          .from('skills')
          .select('id')
          .eq('name', normalized)
          .maybeSingle();

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

        await (supabase as any).from('candidate_skills').insert({
          candidate_id: candidate.id,
          skill_id: skillId,
          proficiency: 'intermediate',
        });
      }
    }
  }

  // Update employer table if applicable
  if (!candidate) {
    const { data: employer }: { data: any } = await (supabase as any)
      .from('employers')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (employer) {
      // Employers don't have headline/location directly — handled via organizations
      // Placeholder: extend as schema grows
    }
  }

  return NextResponse.json({ success: true });
}
