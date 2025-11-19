/**
 * Input Preparation Component
 *
 * Shows data blocks coming together before BLAKE3 hashing.
 * Displays customer identity data and bank data sliding together.
 * Duration: ~1 second
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/utils';
import type { GeneratorData } from '../types';

interface InputPreparationProps {
  generatorData: GeneratorData;
  onComplete: () => void;
}

/**
 * InputPreparation Component
 *
 * Visual progression:
 * 1. Two blocks appear from sides (0-0.5s)
 * 2. Blocks slide together (0.5s-0.8s)
 * 3. Blocks merge/combine (0.8s-1.0s)
 * 4. Calls onComplete
 */
export const InputPreparation: React.FC<InputPreparationProps> = ({
  generatorData,
  onComplete,
}) => {
  const [stage, setStage] = useState<'appearing' | 'sliding' | 'merged'>('appearing');

  useEffect(() => {
    // Appear stage
    const timer1 = setTimeout(() => setStage('sliding'), 500);

    // Sliding stage
    const timer2 = setTimeout(() => setStage('merged'), 800);

    // Complete
    const timer3 = setTimeout(() => onComplete(), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="font-pixel text-xs text-primary uppercase">
          Preparing Cryptographic Inputs
        </span>
      </div>

      {/* Input blocks visualization */}
      <div className="relative bg-background-dark rounded-pixel border border-primary/30 p-8 min-h-[200px] flex items-center justify-center overflow-hidden">
        {/* Left Block: Identity Data */}
        <div
          className={cn(
            'absolute flex flex-col items-center justify-center',
            'bg-primary/10 border-2 border-primary rounded-pixel p-6',
            'transition-all duration-500 ease-out',
            'shadow-glow-primary',
            // Position transitions
            stage === 'appearing' && '-left-40 opacity-0',
            stage === 'sliding' && 'left-12 opacity-100',
            stage === 'merged' && 'left-1/2 -translate-x-full opacity-100 scale-95'
          )}
          style={{
            width: '180px',
          }}
        >
          <div className="font-pixel text-xs text-primary mb-2 uppercase">Identity Data</div>
          <div className="font-mono text-sm text-primary/90 text-center break-words">
            {generatorData.customerName}
          </div>
        </div>

        {/* Right Block: Bank Data */}
        <div
          className={cn(
            'absolute flex flex-col items-center justify-center',
            'bg-primary/10 border-2 border-primary rounded-pixel p-6',
            'transition-all duration-500 ease-out',
            'shadow-glow-primary',
            // Position transitions
            stage === 'appearing' && '-right-40 opacity-0',
            stage === 'sliding' && 'right-12 opacity-100',
            stage === 'merged' && 'left-1/2 translate-x-0 opacity-100 scale-95'
          )}
          style={{
            width: '180px',
          }}
        >
          <div className="font-pixel text-xs text-primary mb-2 uppercase">Bank Data</div>
          <div className="font-mono text-sm text-primary/90 text-center space-y-1">
            <div>••••{generatorData.accountLast4}</div>
            <div className="text-xs">{generatorData.routingNumber}</div>
          </div>
        </div>

        {/* Plus sign between blocks */}
        {stage === 'sliding' && (
          <div className="absolute text-4xl font-bold text-primary animate-pulse opacity-60">+</div>
        )}

        {/* Merged indicator */}
        {stage === 'merged' && (
          <div className="absolute text-xs font-pixel text-primary bottom-4 right-4">
            READY FOR HASHING
          </div>
        )}
      </div>

      {/* Input details */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <div className="text-neutral-500 font-pixel uppercase">Customer</div>
          <div className="font-mono text-neutral-400 truncate">{generatorData.customerName}</div>
        </div>
        <div className="space-y-1">
          <div className="text-neutral-500 font-pixel uppercase">Account</div>
          <div className="font-mono text-neutral-400">
            ••••{generatorData.accountLast4} / {generatorData.routingNumber}
          </div>
        </div>
      </div>
    </div>
  );
};
