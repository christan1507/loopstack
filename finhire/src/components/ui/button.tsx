import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  asChild?: boolean;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, loading, disabled, asChild, href, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
      outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const className_ = cn(base, variants[variant], sizes[size], className);

    if (asChild && href) {
      return (
        <Link href={href} className={className_}>
          {loading ? 'Loading…' : children}
        </Link>
      );
    }

    if (href) {
      return (
        <Link href={href} className={className_}>
          {loading ? 'Loading…' : children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={className_}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? 'Loading…' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
