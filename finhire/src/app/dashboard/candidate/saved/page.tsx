import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SavedJobsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Saved Jobs</h1>
      <Card>
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">Save jobs to review later — coming soon.</p>
        </div>
      </Card>
    </div>
  );
}
