'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  userId: string;
  mode: 'employer' | 'candidate';
}

const sb = createClient() as any;

export function OnboardingForm({ userId, mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgSize, setOrgSize] = useState('');
  const [employerTitle, setEmployerTitle] = useState('');

  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');

  const isEmployer = mode === 'employer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEmployer) {
        const { data: org, error: orgError } = await sb
          .from('organizations')
          .insert({
            name: orgName,
            website: orgWebsite || null,
            industry: orgIndustry || null,
            size: orgSize || null,
          })
          .select()
          .single();

        if (orgError) throw orgError;

        await sb
          .from('profiles')
          .update({ role: 'employer' })
          .eq('id', userId);

        const { error: empError } = await sb
          .from('employers')
          .insert({
            profile_id: userId,
            organization_id: org.id,
            title: employerTitle || null,
          });

        if (empError) throw empError;

        router.push('/dashboard/employer');
      } else {
        await sb
          .from('profiles')
          .update({ role: 'candidate' })
          .eq('id', userId);

        const { error: candError } = await sb
          .from('candidates')
          .insert({
            profile_id: userId,
            headline: headline || null,
            location: location || null,
            years_experience: yearsExperience ? parseInt(yearsExperience) : null,
          });

        if (candError) throw candError;

        router.push('/dashboard/candidate');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {isEmployer ? 'Set up your company profile' : 'Complete your candidate profile'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isEmployer
            ? 'Tell us about your company so candidates can find you'
            : 'Tell us about yourself so employers can find you'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm dark:bg-slate-800 dark:border-slate-700 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isEmployer ? (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Company</h2>
              <div className="space-y-4">
                <Input
                  label="Company Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
                <Input
                  label="Website"
                  type="url"
                  value={orgWebsite}
                  onChange={(e) => setOrgWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Industry"
                    value={orgIndustry}
                    onChange={(e) => setOrgIndustry(e.target.value)}
                    placeholder="e.g. Asset Management"
                  />
                  <Input
                    label="Company Size"
                    value={orgSize}
                    onChange={(e) => setOrgSize(e.target.value)}
                    placeholder="e.g. 50-200"
                  />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Role</h2>
              <Input
                label="Job Title"
                value={employerTitle}
                onChange={(e) => setEmployerTitle(e.target.value)}
                placeholder="e.g. Head of AI Research"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Professional</h2>
              <div className="space-y-4">
                <Input
                  label="Headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. ML Engineer focused on algorithmic trading"
                />
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, NY or Remote"
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  min="0"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>
          </>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Complete Setup
        </Button>
      </form>
    </div>
  );
}
