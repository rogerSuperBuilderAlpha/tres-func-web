'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { SunSolidIcon, MoonSolidIcon } from '@/components/ui';

export const ThemeToggle = memo(function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial preference
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev;
      document.documentElement.classList.toggle('dark', newValue);
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  }, []);

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      onClick={toggle}
      className="relative p-2 rounded-lg bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 transition"
      aria-label={label}
      aria-pressed={isDark}
      type="button"
    >
      {/* Sun icon */}
      <SunSolidIcon
        className={`w-5 h-5 text-gold-500 transition-all ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
        aria-hidden="true"
      />
      {/* Moon icon */}
      <MoonSolidIcon
        className={`w-5 h-5 text-gold-400 absolute top-2 left-2 transition-all ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
        aria-hidden="true"
      />
    </button>
  );
});

