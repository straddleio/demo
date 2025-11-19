/**
 * Variation Tree Component
 *
 * Displays name variations in a tree structure with expanding animation
 * Shows 6-8 variations generated from the normalized name
 * Duration: ~2 seconds
 */

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/components/ui/utils';
import { generateNameVariations } from '@/lib/name-variations';

interface VariationTreeProps {
  normalizedName: string;
  onComplete: (variations: string[]) => void;
}

/**
 * VariationTree Component
 *
 * Visual progression:
 * 1. Shows root node (0-0.3s)
 * 2. Expands branches one by one (0.3s-1.8s)
 * 3. Final glow effect (1.8s-2.0s)
 * 4. Calls onComplete with variations array
 */
export const VariationTree: React.FC<VariationTreeProps> = ({ normalizedName, onComplete }) => {
  const variations = useMemo(() => generateNameVariations(normalizedName), [normalizedName]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Show root immediately
    setVisibleCount(1);

    // Stagger branch animations (show one every ~200ms)
    const branchTimers = variations.slice(1).map((_, index) => {
      return setTimeout(
        () => {
          setVisibleCount(index + 2);
        },
        300 + index * 200
      );
    });

    // Complete after all branches shown + 200ms
    const completeTimer = setTimeout(
      () => {
        onComplete(variations);
      },
      300 + variations.length * 200
    );

    return () => {
      branchTimers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [variations, onComplete]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="font-pixel text-xs text-primary uppercase">Generating Variations</span>
      </div>

      {/* Tree visualization */}
      <div className="bg-background-dark rounded-pixel border border-primary/30 p-6">
        <div className="space-y-2 font-mono text-sm">
          {/* Root node - original normalized name */}
          <div
            className={cn(
              'text-primary font-bold transition-all duration-300',
              visibleCount >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            )}
          >
            {normalizedName}
          </div>

          {/* Variation branches */}
          {variations.slice(1).map((variation, index) => {
            const isVisible = visibleCount > index + 1;
            const isLast = index === variations.length - 2;

            return (
              <div
                key={variation}
                className={cn(
                  'pl-4 flex items-start gap-2 transition-all duration-300',
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                )}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Branch connector */}
                <span className="text-primary/60 select-none">{isLast ? '└─' : '├─'}</span>

                {/* Variation text */}
                <span
                  className={cn(
                    'text-primary/90',
                    isVisible && 'shadow-glow-primary/50',
                    variation === normalizedName && 'opacity-50'
                  )}
                >
                  {variation}
                </span>
              </div>
            );
          })}
        </div>

        {/* Variation count */}
        <div className="mt-4 pt-4 border-t border-primary/20 text-xs font-pixel text-primary/60">
          {visibleCount} / {variations.length} variations generated
        </div>
      </div>

      {/* Explanation */}
      <div className="text-xs text-neutral-500 font-body">
        Generating common name permutations for identity matching...
      </div>
    </div>
  );
};
