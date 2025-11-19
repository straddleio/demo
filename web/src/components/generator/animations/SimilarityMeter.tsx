/**
 * Similarity Meter Component
 *
 * Shows name matching against account names with correlation score
 * Visualizes comparison process with progress bar
 * Duration: ~2.5 seconds
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/utils';

interface SimilarityMeterProps {
  variations: string[];
  namesOnAccount: string[];
  matchedName: string;
  correlationScore: number;
  onComplete: () => void;
}

/**
 * SimilarityMeter Component
 *
 * Visual progression:
 * 1. Shows account names (0-0.5s)
 * 2. Highlights matched name (0.5s-1.0s)
 * 3. Animates progress bar from 0 to correlationScore (1.0s-2.0s)
 * 4. Shows final confidence (2.0s-2.5s)
 * 5. Calls onComplete
 */
export const SimilarityMeter: React.FC<SimilarityMeterProps> = ({
  variations,
  namesOnAccount,
  matchedName,
  correlationScore,
  onComplete,
}) => {
  const [stage, setStage] = useState<'comparing' | 'matched' | 'scoring' | 'complete'>('comparing');
  const [currentScore, setCurrentScore] = useState(0);

  // Stage progression
  useEffect(() => {
    const timer1 = setTimeout(() => setStage('matched'), 500);
    const timer2 = setTimeout(() => setStage('scoring'), 1000);
    const timer3 = setTimeout(() => setStage('complete'), 2000);
    const timer4 = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  // Animate score from 0 to correlationScore
  useEffect(() => {
    let scoreInterval: NodeJS.Timeout | undefined;

    if (stage === 'scoring') {
      const duration = 1000; // 1 second
      const steps = 20;
      const increment = correlationScore / steps;
      const stepDuration = duration / steps;

      let step = 0;
      scoreInterval = setInterval(() => {
        step++;
        setCurrentScore(Math.min(correlationScore, step * increment));
        if (step >= steps) {
          if (scoreInterval) {
            clearInterval(scoreInterval);
          }
          setCurrentScore(correlationScore);
        }
      }, stepDuration);
    }

    return () => {
      if (scoreInterval) {
        clearInterval(scoreInterval);
      }
    };
  }, [stage, correlationScore]);

  const scorePercentage = stage === 'scoring' || stage === 'complete' ? currentScore : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="font-pixel text-xs text-primary uppercase">Identity Matching</span>
      </div>

      {/* Comparison area */}
      <div className="bg-background-dark rounded-pixel border border-primary/30 p-6 space-y-4">
        {/* Names on account */}
        <div className="space-y-2">
          <div className="text-xs font-pixel text-neutral-500 uppercase">
            Account Names ({namesOnAccount.length})
          </div>
          <div className="space-y-2">
            {namesOnAccount.map((name) => {
              const isMatched = name === matchedName;
              const showMatch = stage !== 'comparing';

              return (
                <div
                  key={name}
                  className={cn(
                    'flex items-center gap-2 font-mono text-sm transition-all duration-500',
                    isMatched && showMatch
                      ? 'text-accent-green font-bold scale-105'
                      : 'text-neutral-400'
                  )}
                >
                  {/* Match indicator */}
                  <span
                    className={cn(
                      'text-lg transition-all duration-300',
                      isMatched && showMatch
                        ? 'text-accent-green scale-100 opacity-100'
                        : 'text-neutral-700 scale-75 opacity-50'
                    )}
                  >
                    {isMatched && showMatch ? '✓' : '○'}
                  </span>

                  {/* Name text */}
                  <span
                    className={cn(
                      'transition-all duration-500',
                      isMatched && showMatch && 'shadow-glow-green'
                    )}
                  >
                    {name}
                  </span>

                  {/* Matched label */}
                  {isMatched && showMatch && (
                    <span className="ml-auto text-xs font-pixel text-accent-green uppercase animate-pulse">
                      Matched
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison progress */}
        {stage !== 'comparing' && (
          <div className="pt-4 border-t border-primary/20 space-y-2">
            <div className="text-xs font-pixel text-neutral-500">
              Comparing {variations.length} variation pairs...
            </div>
          </div>
        )}
      </div>

      {/* Correlation score meter */}
      <div className="bg-background-dark rounded-pixel border border-primary/30 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-xs text-primary uppercase">WALDO Confidence</span>
          <span
            className={cn(
              'font-mono text-lg font-bold transition-all duration-300',
              stage === 'complete' ? 'text-accent-green' : 'text-primary'
            )}
          >
            {Math.round(scorePercentage)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-6 bg-background-dark border border-primary/30 rounded-pixel overflow-hidden">
          {/* Fill */}
          <div
            className={cn(
              'absolute inset-y-0 left-0 transition-all duration-1000 ease-out',
              scorePercentage >= 80 ? 'bg-accent-green' : 'bg-primary',
              scorePercentage >= 80 && 'shadow-glow-green',
              scorePercentage < 80 && scorePercentage > 0 && 'shadow-glow-primary'
            )}
            style={{ width: `${scorePercentage}%` }}
          />

          {/* Percentage text overlay */}
          <div className="absolute inset-0 flex items-center justify-center font-pixel text-xs">
            {stage === 'scoring' || stage === 'complete' ? (
              <span
                className={cn(
                  'transition-colors duration-300',
                  scorePercentage >= 50 ? 'text-background-dark' : 'text-neutral-500'
                )}
              >
                {Math.round(scorePercentage)}%
              </span>
            ) : (
              <span className="text-neutral-600">0%</span>
            )}
          </div>
        </div>

        {/* Score interpretation */}
        {stage === 'complete' && (
          <div
            className={cn(
              'text-xs font-pixel uppercase text-center transition-opacity duration-500',
              stage === 'complete' ? 'opacity-100' : 'opacity-0',
              correlationScore >= 80 ? 'text-accent-green' : 'text-gold'
            )}
          >
            {correlationScore >= 90
              ? 'High Confidence Match'
              : correlationScore >= 80
                ? 'Good Match'
                : correlationScore >= 60
                  ? 'Moderate Match'
                  : 'Low Confidence'}
          </div>
        )}
      </div>
    </div>
  );
};
