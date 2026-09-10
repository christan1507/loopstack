'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div>
                <span className="text-xl font-bold text-teal-700 dark:text-teal-400 block leading-tight">FinHire</span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Metaskills Institute</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/jobs" className="text-sm text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
                Browse Jobs
              </Link>
              {user && (
                <Link href="/search" className="text-sm text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
                  Find Candidates
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {loading ? (
              <div className="w-20 h-8" />
            ) : user ? (
              <>
                <Link href={`/dashboard/${user.role}`}>
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <Button variant="ghost" size="sm" type="submit">Sign out</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/post-job">
                  <Button size="sm">Post a Job</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
