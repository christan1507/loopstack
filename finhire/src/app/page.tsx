import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
              Where <span className="text-teal-600">AI</span> meets{' '}
              <span className="text-teal-600">Finance</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
              The niche job board connecting AI/ML/quant talent with finance-forward companies.
              AI-powered matching to find your perfect role — or your perfect candidate.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/jobs">
                <Button size="lg">Browse Jobs</Button>
              </Link>
              <Link href="/post-job">
                <Button variant="outline" size="lg">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">
            Built for the AI-in-Finance niche
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                AI-Powered Matching
              </h3>
              <p className="text-slate-600 text-sm">
                Every job is matched to candidates with an AI score and explanation.
                No more sifting through irrelevant profiles.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Smart Cover Letters
              </h3>
              <p className="text-slate-600 text-sm">
                Generate tailored cover letters for any job in seconds.
                Personalized to your profile and the role&apos;s requirements.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Finance-First Roles
              </h3>
              <p className="text-slate-600 text-sm">
                Only AI/ML/quant/AI-compliance roles at finance companies.
                No noise — signal only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to hire — or get hired?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join the platform built for the intersection of AI and finance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register?type=candidate">
              <Button size="lg">Join as Candidate</Button>
            </Link>
            <Link href="/register?type=employer">
              <Button variant="outline" size="lg">
                Join as Employer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} FinHire. All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link href="/about" className="text-sm text-slate-500 hover:text-teal-700">
              About
            </Link>
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-teal-700">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-slate-500 hover:text-teal-700">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
