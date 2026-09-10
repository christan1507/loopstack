'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CandidateDashboardProps {
  candidate: {
    id: string;
    headline: string | null;
    location: string | null;
    years_experience: number | null;
    is_premium: boolean;
    profiles: { full_name: string | null; email: string };
    candidate_skills: Array<{ skill: { name: string } }>;
    projects: Array<{ name: string; tech_stack: string[] }>;
    certifications: Array<{ name: string }>;
  };
}

export default function CandidateDashboardClient({ candidate }: CandidateDashboardProps) {
  const name = candidate.profiles?.full_name ?? candidate.profiles?.email;
  const skills = candidate.candidate_skills?.map((cs: any) => cs.skill?.name).filter(Boolean) ?? [];
  const projects = candidate.projects ?? [];
  const certs = candidate.certifications ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {name}&apos;s Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {candidate.headline || 'Candidate'} — {candidate.location || 'Location not set'}
            {candidate.years_experience && ` · ${candidate.years_experience} yrs exp`}
          </p>
        </div>
        <div className="flex gap-2">
          {candidate.is_premium && (
            <Badge variant="gold">Premium</Badge>
          )}
          <Link href="/profile/edit">
            <Button variant="outline" size="sm">Edit Profile</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/candidate/applications">
          <StatCard label="Applications" value="0" />
        </Link>
        <StatCard label="Matches" value="—" />
        <StatCard label="Profile Views" value="—" />
      </div>

      {/* Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Matches */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Job Matches</h2>
            <p className="text-sm text-slate-500">
              Browse jobs and our AI will match you with the best opportunities.
            </p>
            <Link href="/jobs" className="inline-block mt-4">
              <Button size="sm">Browse Jobs</Button>
            </Link>
          </Card>

          {/* Recent Applications */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Applications</h2>
            <p className="text-sm text-slate-500">
              Your applications will appear here once you apply to jobs.
            </p>
            <Link href="/jobs" className="inline-block mt-4">
              <Button variant="outline" size="sm">Browse Jobs</Button>
            </Link>
          </Card>
        </div>

        {/* Right column — profile sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Skills</h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No skills added yet. Edit your profile to add skills.</p>
            )}
          </Card>

          {/* Projects */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Projects</h3>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project: any) => (
                  <div key={project.id} className="border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                    <p className="text-sm font-medium text-slate-900">{project.name}</p>
                    {project.tech_stack?.length > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {project.tech_stack.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No projects yet.</p>
            )}
          </Card>

          {/* Certifications */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Certifications</h3>
            {certs.length > 0 ? (
              <div className="space-y-2">
                {certs.slice(0, 5).map((cert: any) => (
                  <p key={cert.id} className="text-sm text-slate-700">{cert.name}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No certifications yet.</p>
            )}
          </Card>
        </div>
      </div>
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
