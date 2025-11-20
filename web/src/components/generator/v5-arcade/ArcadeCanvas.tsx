import React, { useEffect, useRef } from 'react';
import { GameEngine } from './core/GameEngine';

interface Props {
  width?: number;
  height?: number;
}

export const ArcadeCanvas: React.FC<Props> = ({ width = 640, height = 480 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Create and start game engine
    engineRef.current = new GameEngine(ctx);
    engineRef.current.start();

    return () => {
      engineRef.current?.stop();
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      role="img"
      aria-label="Arcade game canvas"
      className="arcade-canvas"
    />
  );
};
