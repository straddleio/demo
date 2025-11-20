import React from 'react';

interface StageIndicatorProps {
  currentStage: number;
  totalStages: number;
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({ currentStage, totalStages }) => {
  return (
    <div data-testid="stage-indicator" className="arcade-stage">
      STAGE: {currentStage}/{totalStages}
    </div>
  );
};
