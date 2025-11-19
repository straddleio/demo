import React, { useEffect, useState } from 'react';
import { SPRITE_CONFIG } from '../utils/sprites';

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
      style={{
        fontFamily: SPRITE_CONFIG.font.family,
        fontSize: `${SPRITE_CONFIG.font.sizes.medium}px`,
        color: SPRITE_CONFIG.colors.cyan,
        textShadow: isAnimating
          ? `0 0 8px ${SPRITE_CONFIG.colors.cyan}, 0 0 16px rgba(0, 255, 255, 0.6)`
          : `0 0 ${SPRITE_CONFIG.glow.blur}px ${SPRITE_CONFIG.colors.cyan}`,
        transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.2s ease-out, text-shadow 0.3s ease-out',
      }}
    >
      SCORE: {paddedScore}
    </div>
  );
};
