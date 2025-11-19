/**
 * WALDO Stage Component
 *
 * Orchestrates the three WALDO identity matching animations in sequence:
 * 1. NameNormalizer (~1.5s)
 * 2. VariationTree (~2s)
 * 3. SimilarityMeter (~2.5s)
 *
 * Total duration: ~6 seconds
 * Only rendered for Plaid paykeys (when waldoData exists)
 */

import React, { useState } from 'react';
import type { GeneratorData } from '../generator/types';
import { NameNormalizer } from './animations/NameNormalizer';
import { VariationTree } from './animations/VariationTree';
import { SimilarityMeter } from './animations/SimilarityMeter';

interface WaldoStageProps {
  generatorData: GeneratorData;
  onComplete: () => void;
}

type AnimationStage = 'normalize' | 'variations' | 'similarity' | 'done';

/**
 * WaldoStage Component
 *
 * Manages WALDO animation progression:
 * - Shows each animation in sequence
 * - Passes data between stages
 * - Calls onComplete when all animations finish
 */
export const WaldoStage: React.FC<WaldoStageProps> = ({ generatorData, onComplete }) => {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationStage>('normalize');
  const [normalizedName, setNormalizedName] = useState<string>('');
  const [variations, setVariations] = useState<string[]>([]);
  const hasCalledComplete = React.useRef(false);

  // If no WALDO data, skip immediately (only once)
  React.useEffect(() => {
    if (!generatorData.waldoData && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onComplete();
    }
  }, [generatorData.waldoData, onComplete]);

  // If no WALDO data, don't render anything
  if (!generatorData.waldoData) {
    return null;
  }

  const { waldoData } = generatorData;

  // Handle completion of name normalization
  const handleNormalizeComplete = (normalized: string): void => {
    setNormalizedName(normalized);
    setCurrentAnimation('variations');
  };

  // Handle completion of variation tree
  const handleVariationsComplete = (vars: string[]): void => {
    setVariations(vars);
    setCurrentAnimation('similarity');
  };

  // Handle completion of similarity matching
  const handleSimilarityComplete = (): void => {
    setCurrentAnimation('done');
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Stage 1: Name Normalization */}
      {currentAnimation === 'normalize' && (
        <NameNormalizer
          customerName={generatorData.customerName}
          onComplete={handleNormalizeComplete}
        />
      )}

      {/* Stage 2: Variation Tree */}
      {currentAnimation === 'variations' && (
        <VariationTree normalizedName={normalizedName} onComplete={handleVariationsComplete} />
      )}

      {/* Stage 3: Similarity Meter */}
      {currentAnimation === 'similarity' && (
        <SimilarityMeter
          variations={variations}
          namesOnAccount={waldoData.namesOnAccount}
          matchedName={waldoData.matchedName}
          correlationScore={waldoData.correlationScore}
          onComplete={handleSimilarityComplete}
        />
      )}
    </div>
  );
};
