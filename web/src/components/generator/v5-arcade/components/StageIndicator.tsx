import React from 'react';
import { SPRITE_CONFIG } from '../utils/sprites';

interface StageIndicatorProps {
  currentStage: number;
  totalStages: number;
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({ currentStage, totalStages }) => {
  return (
    <div
      data-testid="stage-indicator"
      style={{
        fontFamily: SPRITE_CONFIG.font.family,
        fontSize: `${SPRITE_CONFIG.font.sizes.medium}px`,
        color: SPRITE_CONFIG.colors.magenta,
        textShadow: `0 0 ${SPRITE_CONFIG.glow.blur}px ${SPRITE_CONFIG.colors.magenta}`,
      }}
    >
      STAGE: {currentStage}/{totalStages}
    </div>
  );
};
