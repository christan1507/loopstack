import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatSalary } from '@/lib/utils';

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: candidate }: { data: any } = await (supabase as any)
    .from('candidates')
    .select('*, profiles(*), candidate_skills(skill:skills(*)), projects(*), certifications(*)')
    .eq('id', id)
    .single();

  if (!candidate) notFound();

  const profile = candidate.profiles;
  const skills = (candidate.candidate_skills ?? [])
    .map((cs: any) => cs.skill)
    .filter(Boolean);
  const projects = candidate.projects ?? [];
  const certs = candidate.certifications ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {profile?.full_name ?? 'Candidate'}
        </h1>
        <p className="text-lg text-slate-600 mt-1">{candidate.headline}</p>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          {candidate.location && (
            <span className="text-sm text-slate-500">{candidate.location}</span>
          )}
          {candidate.years_experience && (
            <span className="text-sm text-slate-500">{candidate.years_experience} yrs exp</span>
          )}
          {candidate.is_premium && <Badge variant="gold">Premium</Badge>}
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: any) => (
              <Badge key={skill.id} variant="teal">{skill.name}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Projects</h2>
          <div className="space-y-4">
            {projects.map((project: any) => (
              <div key={project.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                <h3 className="font-medium text-slate-900">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                )}
                {project.tech_stack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {project.tech_stack.map((tech: string) => (
                      <span key={tech} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.url && (
                  <Link href={project.url} target="_blank" className="text-sm text-teal-700 hover:underline mt-2 inline-block">
                    View Project →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Certifications</h2>
          <div className="space-y-3">
            {certs.map((cert: any) => (
              <div key={cert.id}>
                <p className="text-sm font-medium text-slate-900">{cert.name}</p>
                {cert.issuer && <p className="text-xs text-slate-500">{cert.issuer}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {skills.length === 0 && projects.length === 0 && certs.length === 0 && (
        <Card>
          <p className="text-slate-500 text-center py-8">No profile details yet.</p>
        </Card>
      )}
    </div>
  );
}
