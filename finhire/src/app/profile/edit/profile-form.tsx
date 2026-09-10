'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SKILL_CATEGORIES = [
  { value: 'technical', label: 'Technical' },
  { value: 'domain', label: 'Domain' },
  { value: 'soft', label: 'Soft' },
];

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

interface ProfileFormClientProps {
  profileId: string;
  fullName: string;
  headline: string;
  location: string;
  yearsExperience: number | null;
  skills: Array<{ id: string; name: string; category: string }>;
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    url: string | null;
    tech_stack: string[];
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string | null;
    issue_date: string | null;
    expiry_date: string | null;
  }>;
}

export default function ProfileFormClient({
  profileId,
  fullName,
  headline,
  location,
  yearsExperience,
  skills,
  projects,
  certifications,
}: ProfileFormClientProps) {
  const supabase = createClient();

  const [formData, setFormData] = useState({
    full_name: fullName,
    headline,
    location,
    years_experience: yearsExperience ?? '',
  });

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('technical');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');
  const [skillSuggestions, setSkillSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    url: '',
    tech_stack: '',
  });

  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const allSkillNames = useMemo(() => {
    return skills.map((s) => s.name).filter(Boolean);
  }, [skills]);

  async function searchSkills(query: string) {
    if (!query.trim()) {
      setSkillSuggestions([]);
      return;
    }

    setSuggestionLoading(true);
    const { data } = await (supabase as any)
      .from('skills')
      .select('id, name')
      .ilike('name', `%${query}%`)
      .limit(8);

    setSkillSuggestions(data ?? []);
    setSuggestionLoading(false);
  }

  function handleAddExistingSkill(skill: { id: string; name: string }) {
    addSkill(skill.id, skill.name, newSkillCategory, newSkillProficiency);
    setNewSkillName('');
    setSkillSuggestions([]);
  }

  async function addSkill(
    skillId: string,
    name: string,
    category: string,
    proficiency: string
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await (supabase as any)
      .from('candidate_skills')
      .insert({
        candidate_id: user.id,
        skill_id: skillId,
        proficiency,
      });

    if (error) {
      setError(error.message);
    } else {
      window.location.reload();
    }
  }

  async function addNewSkill() {
    if (!newSkillName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const normalized = newSkillName.trim();
    const { data: existing } = await (supabase as any)
      .from('skills')
      .select('id')
      .eq('name', normalized)
      .maybeSingle();

    const skillId = existing?.id ?? (
      await (supabase as any)
        .from('skills')
        .insert({ name: normalized, category: newSkillCategory })
        .select('id')
        .single()
    ).data.id;

    await addSkill(skillId, normalized, newSkillCategory, newSkillProficiency);
  }

  async function removeSkill(skillId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await (supabase as any)
      .from('candidate_skills')
      .delete()
      .eq('candidate_id', user.id)
      .eq('skill_id', skillId);

    if (error) {
      setError(error.message);
    } else {
      window.location.reload();
    }
  }

  async function addProject() {
    if (!newProject.name.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const techStack = newProject.tech_stack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await (supabase as any)
      .from('projects')
      .insert({
        candidate_id: user.id,
        name: newProject.name.trim(),
        description: newProject.description.trim() || null,
        url: newProject.url.trim() || null,
        tech_stack: techStack,
      });

    if (error) {
      setError(error.message);
    } else {
      setNewProject({ name: '', description: '', url: '', tech_stack: '' });
      window.location.reload();
    }
  }

  async function removeProject(projectId: string) {
    const { error } = await (supabase as any)
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      setError(error.message);
    } else {
      window.location.reload();
    }
  }

  async function addCertification() {
    if (!newCert.name.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await (supabase as any)
      .from('certifications')
      .insert({
        candidate_id: user.id,
        name: newCert.name.trim(),
        issuer: newCert.issuer.trim() || null,
        issue_date: newCert.issue_date || null,
        expiry_date: newCert.expiry_date || null,
      });

    if (error) {
      setError(error.message);
    } else {
      setNewCert({ name: '', issuer: '', issue_date: '', expiry_date: '' });
      window.location.reload();
    }
  }

  async function removeCertification(certId: string) {
    const { error } = await (supabase as any)
      .from('certifications')
      .delete()
      .eq('id', certId);

    if (error) {
      setError(error.message);
    } else {
      window.location.reload();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const yearsExp =
      formData.years_experience === '' ? null : Number(formData.years_experience);

    const { error: profileError } = await (supabase as any)
      .from('profiles')
      .update({ full_name: formData.full_name.trim() })
      .eq('id', profileId);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const { error: candidateError } = await (supabase as any)
      .from('candidates')
      .update({
        headline: formData.headline.trim() || null,
        location: formData.location.trim() || null,
        years_experience: yearsExp,
      })
      .eq('profile_id', user.id);

    if (candidateError) {
      setError(candidateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      window.location.href = '/dashboard/candidate?success=1';
    }, 800);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-700">
          Profile updated successfully!
        </div>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Jane Doe"
          />
          <Input
            label="Headline"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            placeholder="e.g. Quant Researcher at Acme"
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="New York, NY or Remote"
          />
          <Input
            label="Years of Experience"
            type="number"
            min="0"
            max="50"
            value={formData.years_experience}
            onChange={(e) =>
              setFormData({ ...formData, years_experience: e.target.value })
            }
            placeholder="0"
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill: any) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-medium"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="ml-0.5 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${skill.name}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={newSkillName}
                onChange={(e) => {
                  setNewSkillName(e.target.value);
                  searchSkills(e.target.value);
                }}
                placeholder="Search or add a new skill"
              />
              {suggestionLoading && (
                <p className="text-xs text-slate-500 mt-1">Searching...</p>
              )}
              {!suggestionLoading && skillSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg">
                  {skillSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleAddExistingSkill(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-36"
              options={SKILL_CATEGORIES}
            />
            <Select
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value)}
              className="w-36"
              options={PROFICIENCY_LEVELS}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addNewSkill}
            disabled={!newSkillName.trim()}
          >
            Add Skill
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Projects</h2>

        {projects.length > 0 && (
          <div className="space-y-4 mb-6">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className="flex items-start justify-between border border-slate-200 rounded-lg p-4"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-teal-700 hover:underline"
                      >
                        {project.url}
                      </a>
                    )}
                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tech_stack.map((tech: string) => (
                          <span
                            key={tech}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(project.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 border-t border-slate-200 pt-4">
          <Input
            label="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="My AI Trading Bot"
          />
          <Textarea
            label="Description"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
            placeholder="Brief description of the project..."
            rows={3}
          />
          <Input
            label="Project URL"
            value={newProject.url}
            onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
            placeholder="https://github.com/..."
          />
          <Input
            label="Tech Stack (comma-separated)"
            value={newProject.tech_stack}
            onChange={(e) =>
              setNewProject({ ...newProject, tech_stack: e.target.value })
            }
            placeholder="Python, TensorFlow, AWS"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addProject}
            disabled={!newProject.name.trim()}
          >
            Add Project
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Certifications</h2>

        {certifications.length > 0 && (
          <div className="space-y-3 mb-6">
            {certifications.map((cert: any) => (
              <div
                key={cert.id}
                className="flex items-start justify-between border border-slate-200 rounded-lg p-4"
              >
                <div>
                  <h3 className="font-medium text-slate-900">{cert.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                    {cert.issuer && <span>{cert.issuer}</span>}
                    {cert.issue_date && (
                      <span>Issued {new Date(cert.issue_date).getFullYear()}</span>
                    )}
                    {cert.expiry_date && (
                      <span>Expires {new Date(cert.expiry_date).getFullYear()}</span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(cert.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 border-t border-slate-200 pt-4">
          <Input
            label="Certification Name"
            value={newCert.name}
            onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
            placeholder="CFA Level III"
          />
          <Input
            label="Issuer"
            value={newCert.issuer}
            onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
            placeholder="CFA Institute"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Issue Date"
              type="date"
              value={newCert.issue_date}
              onChange={(e) =>
                setNewCert({ ...newCert, issue_date: e.target.value })
              }
            />
            <Input
              label="Expiry Date"
              type="date"
              value={newCert.expiry_date}
              onChange={(e) =>
                setNewCert({ ...newCert, expiry_date: e.target.value })
              }
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addCertification}
            disabled={!newCert.name.trim()}
          >
            Add Certification
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-8">
        <Button type="button" variant="outline" href="/dashboard/candidate">
          Cancel
        </Button>
        <Button type="submit" loading={loading} size="lg">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
