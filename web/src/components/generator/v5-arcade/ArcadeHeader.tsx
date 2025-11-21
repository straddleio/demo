import React from 'react';
import '@/styles/arcade.css';

/**
 * ArcadeHeader - Marquee header for V5 arcade-style Paykey Generator
 */
export const ArcadeHeader: React.FC = () => {
  return (
    <div
      className="arcade-header"
      style={{
        borderWidth: '4px',
        borderStyle: 'solid',
        borderColor: 'rgb(0, 255, 255)',
        background:
          'linear-gradient(90deg, rgb(var(--color-background-rgb)) 0%, rgb(var(--color-primary-rgb)) 50%, rgb(var(--color-background-rgb)) 100%)',
        textAlign: 'center',
        boxShadow:
          '0 0 20px rgba(0, 255, 255, 0.6), inset 0 2px 4px rgba(0, 0, 0, 0.4)',
      }}
    >
      <h1
        className="arcade-header__title"
        style={{ fontFamily: '"Press Start 2P", var(--font-pixel)', textAlign: 'center' }}
      >
        ▓▓▓ PAYKEY GENERATOR V5 ▓▓▓
      </h1>
    </div>
  );
};
