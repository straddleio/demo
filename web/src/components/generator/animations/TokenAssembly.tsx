/**
 * Token Assembly Component
 *
 * Shows the paykey token being assembled from the hash.
 * Visual: Hash transforms into segmented paykey format with satisfying snap effect.
 * Duration: ~1.5 seconds
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/utils';

interface TokenAssemblyProps {
  paykeyToken: string; // e.g., "758c519d.02.2c16f91..."
  hash: string; // 64-char BLAKE3 hash
  onComplete: () => void;
}

type AssemblyStage = 'transform' | 'segment' | 'assemble' | 'complete';

/**
 * TokenAssembly Component
 *
 * Visual sequence:
 * 1. Show hash transforming (0-400ms)
 * 2. Hash splits into segments (400-800ms)
 * 3. Segments snap together (800-1200ms)
 * 4. Final token glows (1200-1500ms)
 */
export const TokenAssembly: React.FC<TokenAssemblyProps> = ({ paykeyToken, hash, onComplete }) => {
  const [stage, setStage] = useState<AssemblyStage>('transform');
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    // Parse paykey token into segments (split by periods)
    const tokenSegments = paykeyToken.split('.');

    // Stage 1: Transform (0-400ms)
    const transformTimer = setTimeout(() => {
      setSegments(tokenSegments);
      setStage('segment');
    }, 400);

    // Stage 2: Segment (400-800ms)
    const segmentTimer = setTimeout(() => {
      setStage('assemble');
    }, 800);

    // Stage 3: Assemble (800-1200ms)
    const assembleTimer = setTimeout(() => {
      setStage('complete');
    }, 1200);

    // Stage 4: Complete (1200-1500ms)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(transformTimer);
      clearTimeout(segmentTimer);
      clearTimeout(assembleTimer);
      clearTimeout(completeTimer);
    };
  }, [paykeyToken, onComplete]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-2 h-2 rounded-full transition-colors',
            stage === 'complete' ? 'bg-gold animate-pulse' : 'bg-gold/50 animate-pulse'
          )}
        />
        <span className="font-pixel text-xs uppercase text-gold">
          {stage === 'transform' && 'Transforming Hash'}
          {stage === 'segment' && 'Creating Segments'}
          {stage === 'assemble' && 'Assembling Token'}
          {stage === 'complete' && 'Paykey Minted'}
        </span>
      </div>

      {/* Main visualization area */}
      <div
        className={cn(
          'bg-background-dark rounded-pixel border p-6 min-h-[180px] flex flex-col justify-center transition-all',
          stage === 'complete'
            ? 'border-gold shadow-glow-gold'
            : 'border-gold/30 shadow-glow-gold/30'
        )}
      >
        {/* Stage 1: Show hash */}
        {stage === 'transform' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-xs font-pixel text-neutral-500 uppercase">Input Hash</div>
            <div className="font-mono text-sm text-neutral-400 break-all leading-relaxed opacity-50">
              {hash.substring(0, 32)}...
            </div>
            <div className="text-center">
              <div className="text-gold text-2xl animate-pulse">↓</div>
              <div className="text-xs font-pixel text-gold mt-2">TRANSFORMING</div>
            </div>
          </div>
        )}

        {/* Stage 2: Show segments separated */}
        {stage === 'segment' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-xs font-pixel text-neutral-500 uppercase">Token Segments</div>
            <div className="flex flex-col gap-3 items-center">
              {segments.map((segment, index) => (
                <div
                  key={index}
                  className="font-mono text-sm text-gold px-4 py-2 border border-gold/30 rounded-pixel animate-slide-in-stagger"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {segment}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 3 & 4: Assembled token */}
        {(stage === 'assemble' || stage === 'complete') && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-xs font-pixel text-neutral-500 uppercase">Paykey Token</div>
            <div
              className={cn(
                'font-mono text-lg break-all leading-relaxed transition-all',
                stage === 'complete' ? 'text-gold scale-105' : 'text-gold/70'
              )}
            >
              {segments.map((segment, index) => (
                <React.Fragment key={index}>
                  <span
                    className={cn(
                      'inline-block transition-all',
                      stage === 'assemble' && 'animate-snap-in'
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {segment}
                  </span>
                  {index < segments.length - 1 && <span className="text-gold/50">.</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Token info */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <div className="text-neutral-500 font-pixel uppercase">Format</div>
          <div className="font-mono text-neutral-400">
            {stage === 'transform' && 'Analyzing...'}
            {stage !== 'transform' && `${segments.length} segments`}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-neutral-500 font-pixel uppercase">Status</div>
          <div className="font-mono text-neutral-400">
            {stage === 'complete' ? 'Ready' : 'Processing...'}
          </div>
        </div>
      </div>

      {/* Success message */}
      {stage === 'complete' && (
        <div className="text-xs text-gold font-body flex items-center gap-2 animate-fade-in">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span>Paykey token successfully minted</span>
        </div>
      )}
    </div>
  );
};
