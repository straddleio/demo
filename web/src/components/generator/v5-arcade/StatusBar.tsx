import React from 'react';
import { ScoreDisplay } from './components/ScoreDisplay';
import { StageIndicator } from './components/StageIndicator';
import { ComboMeter } from './components/ComboMeter';
import { StarRating } from './components/StarRating';
import { SPRITE_CONFIG } from './utils/sprites';

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
    <div
      data-testid="status-bar"
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: SPRITE_CONFIG.colors.black,
        border: `2px solid ${SPRITE_CONFIG.colors.cyan}`,
        padding: '8px',
        gap: '16px',
        boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(0, 255, 255, 0.3)`,
        overflow: 'hidden',
      }}
    >
      {/* CRT Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.15) 2px, rgba(0, 0, 0, 0.15) 4px)',
          pointerEvents: 'none',
        }}
      />
      <ScoreDisplay score={score} />
      <StageIndicator currentStage={currentStage} totalStages={totalStages} />
      <ComboMeter comboMultiplier={comboMultiplier} />
      <StarRating stars={stars} />
    </div>
  );
};
