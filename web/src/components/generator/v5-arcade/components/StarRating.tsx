import React from 'react';
import { cn } from '@/components/ui/utils';

interface StarRatingProps {
  stars: number;
}

/**
 * StarRating - Animated star rating display for arcade scoring
 *
 * Enhanced with frontend-design principles:
 * - Staggered pop animation for each filled star (bouncy unlock feel)
 * - Dual-layer glow on gold stars (depth and neon effect)
 * - Subtle pulse on filled stars for alive, dynamic feel
 */
export const StarRating: React.FC<StarRatingProps> = ({ stars }) => {
  const starCount = Math.max(0, Math.min(5, stars));
  const allStars = Array.from({ length: 5 }, (_, i) => i < starCount);

  return (
    <div data-testid="star-rating" className="arcade-stars">
      {allStars.map((isFilled, index) => (
        <span
          key={index}
          className={cn('arcade-star', isFilled && 'arcade-star--filled')}
        >
          {isFilled ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};
