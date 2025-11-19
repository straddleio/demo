import React from 'react';
import { SPRITE_CONFIG } from '../utils/sprites';

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
  const color = isComboActive ? SPRITE_CONFIG.colors.yellow : SPRITE_CONFIG.colors.white;

  return (
    <div
      data-testid="combo-meter"
      style={{
        fontFamily: SPRITE_CONFIG.font.family,
        fontSize: `${SPRITE_CONFIG.font.sizes.medium}px`,
        color,
        textShadow: isComboActive
          ? `0 0 6px ${SPRITE_CONFIG.colors.yellow}, 0 0 12px rgba(255, 255, 0, 0.4)`
          : 'none',
        animation: isComboActive ? 'comboPulse 1s ease-in-out infinite' : 'none',
      }}
    >
      <style>
        {`
          @keyframes comboPulse {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.3); }
          }
        `}
      </style>
      COMBO: x{comboMultiplier}
    </div>
  );
};
