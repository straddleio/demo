import React from 'react';
import { cn } from '@/components/ui/utils';

interface ComboMeterProps {
  comboMultiplier: number;
}

/**
 * ComboMeter - Dynamic combo multiplier display
 *
 * Enhanced with frontend-design principles:
 * - Color change on combo activation (white → yellow)
 * - Pulsing glow animation when combo is active (alive, energetic feel)
 * - Dual-layer shadow for depth on active combos
 */
export const ComboMeter: React.FC<ComboMeterProps> = ({ comboMultiplier }) => {
  const isComboActive = comboMultiplier > 1;

  return (
    <div
      data-testid="combo-meter"
      className={cn('arcade-combo', isComboActive && 'arcade-combo--active')}
    >
      COMBO: x{comboMultiplier}
    </div>
  );
};
