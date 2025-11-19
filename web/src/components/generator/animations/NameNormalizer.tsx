/**
 * Name Normalizer Component
 *
 * Animates the normalization process: customer name → normalized form
 * Shows transformation with character morphing effect
 * Duration: ~1.5 seconds
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/utils';
import { normalizeNameString } from '@/lib/name-variations';

interface NameNormalizerProps {
  customerName: string;
  onComplete: (normalizedName: string) => void;
}

/**
 * NameNormalizer Component
 *
 * Visual progression:
 * 1. Shows original name (0-0.3s)
 * 2. Fade/morph transition (0.3s-1.2s)
 * 3. Shows normalized name (1.2s-1.5s)
 * 4. Calls onComplete with normalized result
 */
export const NameNormalizer: React.FC<NameNormalizerProps> = ({ customerName, onComplete }) => {
  const [stage, setStage] = useState<'original' | 'morphing' | 'normalized'>('original');
  const normalizedName = normalizeNameString(customerName);

  useEffect(() => {
    // Show original for 300ms
    const timer1 = setTimeout(() => setStage('morphing'), 300);

    // Morph for 900ms
    const timer2 = setTimeout(() => setStage('normalized'), 1200);

    // Complete after 1500ms
    const timer3 = setTimeout(() => onComplete(normalizedName), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [normalizedName, onComplete]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="font-pixel text-xs text-primary uppercase">Name Normalization</span>
      </div>

      {/* Name transformation visual */}
      <div className="relative bg-background-dark rounded-pixel border border-primary/30 p-6 min-h-[120px] flex flex-col justify-center">
        {/* Original name */}
        <div
          className={cn(
            'absolute inset-6 flex items-center justify-center',
            'font-mono text-2xl transition-all duration-700',
            stage === 'original' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
        >
          <span className="text-neutral-200">{customerName}</span>
        </div>

        {/* Morphing indicator */}
        {stage === 'morphing' && (
          <div className="absolute inset-6 flex items-center justify-center">
            <div className="flex gap-2">
              <div
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: '200ms' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: '400ms' }}
              />
            </div>
          </div>
        )}

        {/* Normalized name */}
        <div
          className={cn(
            'absolute inset-6 flex items-center justify-center',
            'font-mono text-2xl transition-all duration-700',
            stage === 'normalized' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
        >
          <span className="text-primary shadow-glow-primary">{normalizedName}</span>
        </div>

        {/* Arrow indicator during morph */}
        {stage !== 'original' && (
          <div className="absolute right-4 bottom-4 text-xs font-pixel text-primary/60">
            {stage === 'morphing' ? 'NORMALIZING...' : 'COMPLETE'}
          </div>
        )}
      </div>

      {/* Transformation details */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <div className="text-neutral-500 font-pixel uppercase">Original</div>
          <div className="font-mono text-neutral-400 truncate">{customerName}</div>
        </div>
        <div className="space-y-1">
          <div className="text-primary font-pixel uppercase">Normalized</div>
          <div className="font-mono text-primary truncate">{normalizedName}</div>
        </div>
      </div>
    </div>
  );
};
