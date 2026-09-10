import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; error?: string }>;
}) {
  const params = await searchParams;
  const type = params.type || 'candidate';

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">
            {type === 'employer' ? 'Hiring at a finance company?' : 'Looking for AI-in-Finance roles?'}
          </p>
        </div>
        <RegisterForm type={type} />
      </div>
    </div>
  );
}

async function registerAction(formData: FormData) {
  'use server';

  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as 'employer' | 'candidate';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
    },
  });

  if (error) {
    redirect(`/register?type=${role}&error=${encodeURIComponent(error.message)}`);
  }

  // Redirect to the appropriate onboarding flow
  redirect(`/onboarding/${role}`);
}

function RegisterForm({ type }: { type: string }) {
  return (
    <form action={registerAction} className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-4 dark:bg-slate-800 dark:border-slate-700">
      <input type="hidden" name="role" value={type} />
      <Input label="Full Name" name="fullName" required />
      <Input label="Email" name="email" type="email" required />
      <Input label="Password" name="password" type="password" required minLength={8} />
      <Button type="submit" className="w-full">
        Create Account
      </Button>
      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-teal-700 hover:underline dark:text-teal-400">
          Sign in
        </Link>
      </p>
    </form>
  );
}
