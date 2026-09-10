'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  jobId: string;
  jobTitle: string;
  candidateId: string;
}

export default function ApplyForm({ jobId, jobTitle }: Props) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          cover_letter: coverLetter.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit application');
        setLoading(false);
        return;
      }

      router.push('/dashboard/candidate/applications?applied=1');
    } catch (err) {
      setError('Network error — please try again');
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

        <Textarea
          label="Cover Letter (optional)"
          rows={8}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder={`Tell ${jobTitle} why you're a great fit...`}
        />

        <p className="text-xs text-slate-500">
          Your profile, skills, and projects will be shared with the employer.
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" href={`/jobs/${jobId}`}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} size="lg">
            Submit Application
          </Button>
        </div>
      </form>
    </Card>
  );
}
