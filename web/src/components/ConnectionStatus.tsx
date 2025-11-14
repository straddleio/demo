import React from 'react';
import { useDemoStore } from '@/lib/state';

/**
 * Connection status indicator (top-right corner)
 */
export const ConnectionStatus: React.FC = () => {
  const isConnected = useDemoStore((state) => state.isConnected);
  const connectionError = useDemoStore((state) => state.connectionError);

  return (
    <div className="fixed top-4 right-4 z-50">
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
    </div>
  );
};
