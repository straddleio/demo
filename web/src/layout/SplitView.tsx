import React from 'react';
import { RetroContainer } from '@/components/ui/retro-components';

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

/**
 * Main split-screen layout: 40% left (terminal/API log), 60% right (dashboard)
 * Optimized for the "Believe it live" demo segment
 */
export const SplitView: React.FC<SplitViewProps> = ({ left, right }) => {
  return (
    <RetroContainer
      scanlines
      crt
      className="w-full h-screen flex flex-col lg:flex-row bg-background overflow-hidden"
    >
      {/* Left Panel - Terminal + API Log (40%) */}
      <div className="w-full lg:w-2/5 h-1/2 lg:h-full border-b-2 lg:border-b-0 lg:border-r-2 border-primary/30 bg-background-dark overflow-hidden">
        {left}
      </div>

      {/* Right Panel - Dashboard (60%) */}
      <div className="w-full lg:w-3/5 h-1/2 lg:h-full bg-background-card overflow-hidden">
        {right}
      </div>
    </RetroContainer>
  );
};
