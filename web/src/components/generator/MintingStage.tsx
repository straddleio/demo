/**
 * Minting Stage Component
 *
 * Orchestrates the paykey minting animations:
 * 1. TokenAssembly - Shows token being assembled from hash (~1.5s)
 * 2. KeyFlyout - Green key animation flying to dashboard cards (~1.5s)
 *
 * Total duration: ~3 seconds
 */

import React, { useState } from 'react';
import type { GeneratorData } from './types';
import { TokenAssembly } from './animations/TokenAssembly';
import { KeyFlyout } from './animations/KeyFlyout';

interface MintingStageProps {
  generatorData: GeneratorData;
  hash: string; // 64-char BLAKE3 hash from previous stage
  onComplete: () => void;
}

type MintingAnimation = 'assembly' | 'flyout' | 'done';

/**
 * MintingStage Component
 *
 * Manages minting animation progression:
 * - Shows TokenAssembly first
 * - Then shows KeyFlyout animation
 * - Calls onComplete when all animations finish
 */
export const MintingStage: React.FC<MintingStageProps> = ({ generatorData, hash, onComplete }) => {
  const [currentAnimation, setCurrentAnimation] = useState<MintingAnimation>('assembly');

  // Handle completion of token assembly
  const handleAssemblyComplete = (): void => {
    setCurrentAnimation('flyout');
  };

  // Handle completion of key flyout
  const handleFlyoutComplete = (): void => {
    setCurrentAnimation('done');
    // Small delay before closing modal to let flyout animation finish
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  return (
    <>
      {/* Token Assembly Animation */}
      {currentAnimation === 'assembly' && (
        <TokenAssembly
          paykeyToken={generatorData.paykeyToken}
          hash={hash}
          onComplete={handleAssemblyComplete}
        />
      )}

      {/* Key Flyout Animation - overlays on top */}
      {(currentAnimation === 'flyout' || currentAnimation === 'done') && (
        <KeyFlyout onComplete={handleFlyoutComplete} />
      )}

      {/* Show minimal "complete" state during flyout */}
      {currentAnimation === 'flyout' && (
        <div className="space-y-4 opacity-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-pixel text-xs uppercase text-gold">Deploying Keys</span>
          </div>
          <div className="bg-background-dark rounded-pixel border border-gold/30 p-6 min-h-[180px] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="font-pixel text-sm text-gold">Paykey Generated</div>
              <div className="font-mono text-xs text-neutral-500 break-all max-w-md">
                {generatorData.paykeyToken}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
