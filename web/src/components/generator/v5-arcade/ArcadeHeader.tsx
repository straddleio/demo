import React from 'react';

/**
 * ArcadeHeader - Marquee header for V5 arcade-style Paykey Generator
 *
 * Enhanced with frontend-design principles:
 * - Animated gradient background (shifting neon tube effect)
 * - Dual-layer glow (box + text shadows for depth)
 * - Subtle flicker animation (authentic CRT effect)
 * - Press Start 2P retro font with expanded letter spacing
 * - Block character decorations (▓) for arcade framing
 */
export const ArcadeHeader: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(90deg, #000000 0%, #00FFFF 50%, #000000 100%)',
        backgroundSize: '200% 100%',
        border: '4px solid #00FFFF',
        padding: '8px 0',
        textAlign: 'center',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.6), inset 0 2px 4px rgba(0, 0, 0, 0.4)',
        animation: 'gradientShift 4s ease-in-out infinite, flicker 3s ease-in-out infinite',
      }}
    >
      <style>
        {`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.97; }
            75% { opacity: 0.99; }
          }
        `}
      </style>
      <h1
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '18px',
          color: '#FFFFFF',
          textShadow: '0 0 12px #00FFFF, 0 0 24px rgba(0, 255, 255, 0.4)',
          margin: 0,
          letterSpacing: '2px',
        }}
      >
        ▓▓▓ PAYKEY GENERATOR V5 ▓▓▓
      </h1>
    </div>
  );
};
