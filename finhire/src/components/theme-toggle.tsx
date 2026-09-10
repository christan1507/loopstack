'use client';

import { useTheme } from 'next-themes';
import { useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  if (!mounted) {
    return (
      <button
        onMouseEnter={() => setMounted(true)}
        onFocus={() => setMounted(true)}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Toggle theme"
      >
        <span className="text-lg">☀️</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
      aria-label="Toggle theme"
    >
      <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
  );
}
