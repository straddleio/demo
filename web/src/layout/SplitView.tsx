import React from 'react';
import { RetroContainer } from '@/components/ui/retro-components';

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

/**
 * Tiling window manager aesthetic split-screen layout
 * - 40% left (terminal/API log), 60% right (dashboard)
 * - 12px gaps between panes (dark background showing through)
 * - Subtle neon border glow around each pane
 * - Stacks vertically on mobile
 */
export const SplitView: React.FC<SplitViewProps> = ({ left, right }) => {
  return (
    <RetroContainer
      scanlines
      crt
      className="w-full h-screen flex flex-col lg:flex-row bg-background p-3 gap-3 overflow-hidden"
    >
      {/* Left Panel - Terminal + API Log (40%) */}
      <div className="w-full lg:w-2/5 h-1/2 lg:h-full border border-primary/40 rounded-sm shadow-neon-primary bg-background-dark overflow-hidden">
        {left}
      </div>

      {/* Right Panel - Dashboard (60%) */}
      <div className="w-full lg:w-3/5 h-1/2 lg:h-full border border-accent/40 rounded-sm shadow-neon-accent bg-background-card overflow-hidden">
        {right}
      </div>
    </RetroContainer>
  );
};
