import React from 'react';
import { cn } from './utils';

interface PixelSkullProps {
  size?: number;
  className?: string;
}

/**
 * Pixel Art Skull Icon
 * 16x16 pixel art skull designed for retro 8-bit aesthetic
 * Uses simple rectangles to create a classic pixel skull
 *
 * Design:
 * - 16x16 grid
 * - Simple rectangular pixels
 * - Uses currentColor for styling (inherits text color)
 * - Scalable via size prop
 */
export const PixelSkull: React.FC<PixelSkullProps> = ({ size = 16, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={cn('inline-block flex-shrink-0', className)}
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: 'inherit', fill: 'currentColor' }}
    >
      {/* Top of skull */}
      <rect x="4" y="2" width="8" height="1" />
      <rect x="3" y="3" width="10" height="1" />

      {/* Skull forehead */}
      <rect x="2" y="4" width="12" height="1" />
      <rect x="2" y="5" width="12" height="1" />

      {/* Eyes row 1 */}
      <rect x="2" y="6" width="1" height="1" />
      <rect x="4" y="6" width="2" height="1" />
      <rect x="10" y="6" width="2" height="1" />
      <rect x="13" y="6" width="1" height="1" />

      {/* Eyes row 2 */}
      <rect x="2" y="7" width="1" height="1" />
      <rect x="4" y="7" width="2" height="1" />
      <rect x="10" y="7" width="2" height="1" />
      <rect x="13" y="7" width="1" height="1" />

      {/* Nose row 1 */}
      <rect x="2" y="8" width="1" height="1" />
      <rect x="7" y="8" width="2" height="1" />
      <rect x="13" y="8" width="1" height="1" />

      {/* Nose row 2 */}
      <rect x="2" y="9" width="1" height="1" />
      <rect x="7" y="9" width="2" height="1" />
      <rect x="13" y="9" width="1" height="1" />

      {/* Cheeks */}
      <rect x="2" y="10" width="1" height="1" />
      <rect x="13" y="10" width="1" height="1" />

      {/* Jaw line */}
      <rect x="3" y="11" width="1" height="1" />
      <rect x="12" y="11" width="1" height="1" />

      {/* Teeth row 1 */}
      <rect x="4" y="12" width="1" height="1" />
      <rect x="6" y="12" width="1" height="1" />
      <rect x="9" y="12" width="1" height="1" />
      <rect x="11" y="12" width="1" height="1" />

      {/* Teeth row 2 */}
      <rect x="4" y="13" width="1" height="1" />
      <rect x="6" y="13" width="1" height="1" />
      <rect x="9" y="13" width="1" height="1" />
      <rect x="11" y="13" width="1" height="1" />
    </svg>
  );
};
