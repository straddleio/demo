import React from 'react';
import { ScoreDisplay } from './components/ScoreDisplay';
import { StageIndicator } from './components/StageIndicator';
import { ComboMeter } from './components/ComboMeter';
import { StarRating } from './components/StarRating';

interface StatusBarProps {
  score: number;
  currentStage: number;
  totalStages: number;
  comboMultiplier: number;
  stars: number;
}

/**
 * StatusBar - Arcade HUD displaying score, stage, combo, and star rating
 *
 * Enhanced with frontend-design principles:
 * - CRT scanline overlay (authentic monitor effect)
 * - Inset shadow for arcade bezel depth
 * - Dual-layer border glow (neon tube effect)
 */
export const StatusBar: React.FC<StatusBarProps> = ({
  score,
  currentStage,
  totalStages,
  comboMultiplier,
  stars,
}) => {
  return (
    <div data-testid="status-bar" className="arcade-status">
      <ScoreDisplay score={score} />
      <StageIndicator currentStage={currentStage} totalStages={totalStages} />
      <ComboMeter comboMultiplier={comboMultiplier} />
      <StarRating stars={stars} />
    </div>
  );
};
