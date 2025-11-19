/**
 * BLAKE3 Stage Component
 *
 * Orchestrates the three BLAKE3 hashing animations in sequence:
 * 1. InputPreparation (~1s)
 * 2. HashTree (~2.5s)
 * 3. HashFinalization (~1.5s)
 *
 * Total duration: ~5 seconds
 */

import React, { useState } from 'react';
import type { GeneratorData } from './types';
import { InputPreparation } from './animations/InputPreparation';
import { HashTree } from './animations/HashTree';
import { HashFinalization } from './animations/HashFinalization';
import { generateDemoHash } from '@/lib/hash-utils';

interface Blake3StageProps {
  generatorData: GeneratorData;
  onComplete: (hash: string) => void;
}

type AnimationStage = 'preparation' | 'tree' | 'finalization' | 'done';

/**
 * Blake3Stage Component
 *
 * Manages BLAKE3 animation progression:
 * - Shows each animation in sequence
 * - Generates demo hash for visualization
 * - Calls onComplete with final hash when all animations finish
 */
export const Blake3Stage: React.FC<Blake3StageProps> = ({ generatorData, onComplete }) => {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationStage>('preparation');

  // Generate deterministic hash from input data
  const hashInput = `${generatorData.customerName}|${generatorData.accountLast4}|${generatorData.routingNumber}`;
  const finalHash = generateDemoHash(hashInput);

  // Handle completion of input preparation
  const handlePreparationComplete = (): void => {
    setCurrentAnimation('tree');
  };

  // Handle completion of tree hashing
  const handleTreeComplete = (): void => {
    setCurrentAnimation('finalization');
  };

  // Handle completion of hash finalization
  const handleFinalizationComplete = (): void => {
    setCurrentAnimation('done');
    onComplete(finalHash);
  };

  return (
    <div className="space-y-6">
      {/* Stage 1: Input Preparation */}
      {currentAnimation === 'preparation' && (
        <InputPreparation generatorData={generatorData} onComplete={handlePreparationComplete} />
      )}

      {/* Stage 2: Hash Tree */}
      {currentAnimation === 'tree' && <HashTree onComplete={handleTreeComplete} />}

      {/* Stage 3: Hash Finalization */}
      {currentAnimation === 'finalization' && (
        <HashFinalization hash={finalHash} onComplete={handleFinalizationComplete} />
      )}
    </div>
  );
};
