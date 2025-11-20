import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/utils';
import { setSoundEnabled as setSoundEnabledGlobal } from '@/lib/sounds';

/**
 * Sound Effects Toggle
 * UI for enabling/disabling 8-bit sound effects (Mario coin, Zelda overworld, etc.)
 *
 * Phase 3A: UI only - state persisted to localStorage
 * Phase 3D: Will wire up actual audio playback
 *
 * Planned sounds:
 * - Success: Mario coin sound
 * - Fraud catch: Mario "lose" sound
 * - Demo complete: Zelda overworld theme
 */
export const SoundToggle: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Load from localStorage on mount, default to true if not set
    const stored = localStorage.getItem('straddle_sound_enabled');
    const initialValue = stored === null ? true : stored === 'true';
    // Sync with global sound system
    setSoundEnabledGlobal(initialValue);
    return initialValue;
  });

  useEffect(() => {
    // Persist to localStorage and sync with global sound system
    localStorage.setItem('straddle_sound_enabled', String(soundEnabled));
    setSoundEnabledGlobal(soundEnabled);
  }, [soundEnabled]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 border-2 rounded-pixel transition-all',
          'font-body text-xs backdrop-blur-sm',
          soundEnabled
            ? 'border-gold bg-gold/20 text-gold hover:bg-gold/30'
            : 'border-neutral-600 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-800/60'
        )}
        title={soundEnabled ? 'Sound effects enabled' : 'Sound effects disabled'}
      >
        <span className="font-pixel text-base">
          {soundEnabled ? '🔊' : '🔇'}
        </span>
        <span className="hidden sm:inline">
          {soundEnabled ? 'Sound ON' : 'Sound OFF'}
        </span>
      </button>
    </div>
  );
};
