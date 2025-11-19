/**
 * Hash Finalization Component
 *
 * Shows final hash being assembled character by character.
 * Hash format: 64 hex characters (BLAKE3 produces 256-bit = 32 bytes = 64 hex chars)
 * Duration: ~1.5 seconds
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/utils';

interface HashFinalizationProps {
  hash: string; // 64-character hex hash
  onComplete: () => void;
}

/**
 * HashFinalization Component
 *
 * Visual progression:
 * 1. Hash characters type out one-by-one (0-1.2s)
 * 2. Hash pulses/glows when complete (1.2s-1.5s)
 * 3. Calls onComplete
 */
export const HashFinalization: React.FC<HashFinalizationProps> = ({ hash, onComplete }) => {
  const [displayedHash, setDisplayedHash] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    // Type out hash character by character
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < hash.length) {
        setDisplayedHash(hash.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsComplete(true);
      }
    }, 18); // 64 chars in ~1.2s = 18ms per char

    // Complete after hash is fully displayed
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(completeTimer);
    };
  }, [hash, onComplete]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-2 h-2 rounded-full transition-colors',
            isComplete ? 'bg-green-400 animate-pulse' : 'bg-accent animate-pulse'
          )}
        />
        <span
          className={cn(
            'font-pixel text-xs uppercase transition-colors',
            isComplete ? 'text-green-400' : 'text-accent'
          )}
        >
          {isComplete ? 'Hash Generated' : 'Generating Cryptographic Token'}
        </span>
      </div>

      {/* Hash display */}
      <div
        className={cn(
          'bg-background-dark rounded-pixel border p-6 min-h-[140px] flex flex-col justify-center transition-all',
          isComplete
            ? 'border-green-400/50 shadow-glow-green'
            : 'border-accent/30 shadow-glow-accent'
        )}
      >
        {/* Hash output */}
        <div className="font-mono text-sm break-all leading-relaxed">
          <span className={cn('transition-colors', isComplete ? 'text-green-400' : 'text-accent')}>
            {displayedHash}
          </span>
          {/* Cursor */}
          {!isComplete && <span className="inline-block w-2 h-4 bg-accent ml-0.5 animate-pulse" />}
        </div>

        {/* Character count */}
        <div className="mt-4 text-xs font-pixel text-neutral-500 flex justify-between">
          <span>BLAKE3-256</span>
          <span>
            {displayedHash.length}/{hash.length} chars
          </span>
        </div>
      </div>

      {/* Hash info */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <div className="text-neutral-500 font-pixel uppercase">Algorithm</div>
          <div className="font-mono text-neutral-400">BLAKE3 (256-bit)</div>
        </div>
        <div className="space-y-1">
          <div className="text-neutral-500 font-pixel uppercase">Output</div>
          <div className="font-mono text-neutral-400">
            {isComplete ? '32 bytes (64 hex)' : 'Generating...'}
          </div>
        </div>
      </div>

      {/* Feature callout */}
      {isComplete && (
        <div className="text-xs text-green-400 font-body flex items-center gap-2 animate-fade-in">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span>Cryptographic hash generated successfully</span>
        </div>
      )}
    </div>
  );
};
