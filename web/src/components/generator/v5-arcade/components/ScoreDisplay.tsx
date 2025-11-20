import React, { useEffect, useState } from 'react';
import { cn } from '@/components/ui/utils';

interface ScoreDisplayProps {
  score: number;
}

/**
 * ScoreDisplay - Animated score counter for arcade HUD
 *
 * Enhanced with frontend-design principles:
 * - Number roll-in animation when score changes (slot machine feel)
 * - Glow pulse on score increment (visual feedback)
 * - Dual-layer shadow for depth
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const [prevScore, setPrevScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  const paddedScore = score.toString().padStart(5, '0');

  useEffect(() => {
    if (score !== prevScore) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      setPrevScore(score);
      return () => clearTimeout(timer);
    }
  }, [score, prevScore]);

  return (
    <div
      data-testid="score-display"
      className={cn('arcade-score', isAnimating && 'arcade-score--active')}
    >
      SCORE: {paddedScore}
    </div>
  );
};
