import React from 'react';

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
    <div
      data-testid="star-rating"
      style={{
        fontSize: '20px',
        display: 'flex',
        gap: '2px',
      }}
    >
      <style>
        {`
          @keyframes starPop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes starPulse {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.2); }
          }
        `}
      </style>
      {allStars.map((isFilled, index) => (
        <span
          key={index}
          style={{
            color: isFilled ? '#FFD700' : '#444444',
            textShadow: isFilled ? '0 0 6px #FFD700, 0 0 12px rgba(255, 215, 0, 0.4)' : 'none',
            animation: isFilled
              ? `starPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${index * 0.1}s backwards, starPulse 2s ease-in-out infinite ${index * 0.2}s`
              : 'none',
            display: 'inline-block',
          }}
        >
          {isFilled ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};
