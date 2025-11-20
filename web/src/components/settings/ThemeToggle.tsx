import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/utils';

/**
 * Theme Toggle Component
 * Switches between dark mode (retro neon night) and light mode (Ayu light warm daylight)
 *
 * Persists user preference to localStorage
 * Sets data-theme attribute on document root for CSS targeting
 */
export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // Load from localStorage on mount, default to dark (existing theme)
    const stored = localStorage.getItem('straddle_theme');
    return (stored as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    // Persist to localStorage
    localStorage.setItem('straddle_theme', theme);

    // Set data-theme attribute on document root for CSS targeting
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="fixed bottom-4 right-20 z-50">
      <button
        onClick={toggleTheme}
        className={cn(
          'flex items-center gap-2 px-4 py-2 border-2 rounded-pixel transition-all',
          'font-body text-xs backdrop-blur-sm theme-toggle',
          theme === 'dark'
            ? 'border-primary bg-primary/20 text-primary hover:bg-primary/30'
            : 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
        )}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="font-pixel text-base">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
        <span className="hidden sm:inline">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      </button>
    </div>
  );
};
