'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { createJob } from './actions';

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const SENIORITY_LEVELS = [
  { value: '', label: 'Select seniority' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Principal' },
  { value: 'executive', label: 'Executive' },
];

const LOCATION_TYPES = [
  { value: '', label: 'Select work mode' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

export default function PostJobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const requirements = (formData.get('requirements') as string || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const skills = (formData.get('skills') as string || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const result = await createJob({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        employment_type: formData.get('employment_type') as string,
        seniority: (formData.get('seniority') as string) || null,
        location: (formData.get('location') as string) || null,
        location_type: (formData.get('location_type') as string) || 'onsite',
        salary_min: formData.get('salary_min') ? Number(formData.get('salary_min')) : null,
        salary_max: formData.get('salary_max') ? Number(formData.get('salary_max')) : null,
        requirements,
        skills,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Job Title"
                name="title"
                placeholder="e.g. AI Quant Researcher"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Description"
                name="description"
                rows={6}
                placeholder="Describe the role, team, and what success looks like..."
                required
              />
            </div>
            <Select
              label="Employment Type"
              name="employment_type"
              defaultValue="full-time"
              options={EMPLOYMENT_TYPES}
            />
            <Select
              label="Seniority"
              name="seniority"
              options={SENIORITY_LEVELS}
            />
            <div>
              <Input
                label="Location"
                name="location"
                placeholder="e.g. New York, NY"
              />
            </div>
            <Select
              label="Work Mode"
              name="location_type"
              options={LOCATION_TYPES}
            />
            <div>
              <Input
                label="Salary Min ($)"
                name="salary_min"
                type="number"
                placeholder="150000"
              />
            </div>
            <div>
              <Input
                label="Salary Max ($)"
                name="salary_max"
                type="number"
                placeholder="250000"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Requirements & Skills</h2>
          <div className="space-y-4">
            <Textarea
              label="Requirements (comma-separated)"
              name="requirements"
              rows={3}
              placeholder="e.g. PhD in Machine Learning, 3+ years in finance, Python expertise"
            />
            <Input
              label="Required Skills (comma-separated)"
              name="skills"
              placeholder="e.g. Python, Machine Learning, SQL, Financial Modeling"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Your job will be published immediately.
          </p>
          <Button type="submit" loading={loading} size="lg">
            Publish Job
          </Button>
        </div>
      </form>
    </Card>
  );
}
