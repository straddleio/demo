import React from 'react';
import { useDemoStore } from '@/lib/state';
import { useTheme } from '@/lib/theme/useTheme';

/**
 * Connection status indicator with theme toggle (top-right corner)
 */
export const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionError } = useDemoStore((state) => ({
    isConnected: state.isConnected,
    connectionError: state.connectionError,
  }));

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-background-dark/80 border border-primary/30 backdrop-blur-sm">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-accent-green animate-pulse' : 'bg-accent-red'
          }`}
        />
        <span className="text-xs font-pixel text-neutral-300">
          {isConnected ? 'LIVE' : connectionError || 'OFFLINE'}
        </span>
      </div>

      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 rounded bg-background-dark/80 border border-primary/30 backdrop-blur-sm hover:border-primary/60 transition-all theme-toggle-btn"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="text-sm">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </button>
    </div>
  );
};
