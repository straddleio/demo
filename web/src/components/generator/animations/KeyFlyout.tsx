/**
 * Key Flyout Animation Component
 *
 * Creates exit animation with green key icon flying to dashboard cards.
 * Shows key materializing, splitting into two tokens, and flying to destinations.
 * Duration: ~1.5 seconds
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/utils';
import { FiKey } from 'react-icons/fi';

interface KeyFlyoutProps {
  onComplete: () => void;
}

type FlyoutStage = 'materialize' | 'split' | 'fly' | 'fade' | 'done';

/**
 * KeyFlyout Component
 *
 * Visual sequence:
 * 1. Green key materializes in center (0-300ms)
 * 2. Key glows and splits into two tokens (300-600ms)
 * 3. Tokens fly to destinations (600-1200ms)
 * 4. Modal fades out (1200-1500ms)
 */
export const KeyFlyout: React.FC<KeyFlyoutProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<FlyoutStage>('materialize');

  useEffect(() => {
    // Stage 1: Materialize (0-300ms)
    const materializeTimer = setTimeout(() => {
      setStage('split');
    }, 300);

    // Stage 2: Split (300-600ms)
    const splitTimer = setTimeout(() => {
      setStage('fly');
    }, 600);

    // Stage 3: Fly (600-1200ms)
    const flyTimer = setTimeout(() => {
      setStage('fade');
    }, 1200);

    // Stage 4: Fade (1200-1500ms)
    const fadeTimer = setTimeout(() => {
      setStage('done');
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(materializeTimer);
      clearTimeout(splitTimer);
      clearTimeout(flyTimer);
      clearTimeout(fadeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center pointer-events-none transition-opacity',
        stage === 'fade' || stage === 'done' ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Key 1 - Flies to CustomerCard (top-right) */}
      {(stage === 'split' || stage === 'fly' || stage === 'fade') && (
        <div
          className={cn(
            'absolute transition-all duration-600',
            // Initial position: center, slightly up from main key
            stage === 'split' && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-100',
            // Flying position: to customer card (top-right)
            (stage === 'fly' || stage === 'fade') &&
              'left-[75%] top-[20%] -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0'
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            transitionDuration: stage === 'fly' || stage === 'fade' ? '600ms' : '300ms',
          }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 -m-4 bg-accent-green rounded-full blur-xl opacity-60 animate-pulse" />
            {/* Key icon */}
            <div className="relative bg-accent-green rounded-full p-4 shadow-glow-green">
              <FiKey className="w-8 h-8 text-background-dark" />
            </div>
            {/* Particle trail */}
            {stage === 'fly' && (
              <div className="absolute inset-0 animate-ping">
                <div className="w-full h-full bg-accent-green rounded-full opacity-20" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key 2 - Flies to PaykeyCard (middle-right) */}
      {(stage === 'split' || stage === 'fly' || stage === 'fade') && (
        <div
          className={cn(
            'absolute transition-all duration-600',
            // Initial position: center, slightly down from main key
            stage === 'split' && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-100',
            // Flying position: to paykey card (middle-right)
            (stage === 'fly' || stage === 'fade') &&
              'left-[75%] top-[50%] -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0'
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            transitionDuration: stage === 'fly' || stage === 'fade' ? '600ms' : '300ms',
          }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 -m-4 bg-accent-green rounded-full blur-xl opacity-60 animate-pulse" />
            {/* Key icon */}
            <div className="relative bg-accent-green rounded-full p-4 shadow-glow-green">
              <FiKey className="w-8 h-8 text-background-dark" />
            </div>
            {/* Particle trail */}
            {stage === 'fly' && (
              <div className="absolute inset-0 animate-ping">
                <div className="w-full h-full bg-accent-green rounded-full opacity-20" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main key - materializes and splits */}
      {(stage === 'materialize' || stage === 'split') && (
        <div
          className={cn(
            'transition-all duration-300',
            stage === 'materialize' && 'scale-0 opacity-0',
            stage === 'split' && 'scale-125 opacity-100'
          )}
        >
          <div className="relative">
            {/* Glow effect - extra strong during materialize */}
            <div
              className={cn(
                'absolute inset-0 -m-8 bg-accent-green rounded-full blur-2xl animate-pulse',
                stage === 'materialize' ? 'opacity-40' : 'opacity-80'
              )}
            />
            {/* Key icon */}
            <div className="relative bg-accent-green rounded-full p-6 shadow-glow-green">
              <FiKey className="w-12 h-12 text-background-dark" />
            </div>
          </div>
        </div>
      )}

      {/* Status text */}
      {stage !== 'fade' && stage !== 'done' && (
        <div
          className={cn(
            'absolute top-[60%] left-1/2 -translate-x-1/2 transition-opacity',
            stage === 'fly' && 'opacity-0'
          )}
        >
          <div className="text-center space-y-2">
            <div className="font-pixel text-sm text-accent-green uppercase tracking-wider">
              {stage === 'materialize' && 'Generating Keys'}
              {stage === 'split' && 'Keys Created'}
              {stage === 'fly' && 'Deploying'}
            </div>
            <div className="flex gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
