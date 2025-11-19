import React, { useEffect, useRef } from 'react';
import { GameEngine } from './core/GameEngine';
import type { GeneratorData } from '../../../lib/state';

interface Props {
  width?: number;
  height?: number;
  data?: GeneratorData;
  onComplete?: () => void;
}

export const ArcadeCanvas: React.FC<Props> = ({ width = 640, height = 480, data, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Create and start game engine
    engineRef.current = new GameEngine(ctx);
    engineRef.current.setData(data);
    if (onComplete) {
      engineRef.current.setOnComplete(onComplete);
    }
    engineRef.current.start();

    return () => {
      engineRef.current?.stop();
    };
  }, [width, height, data, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      role="img"
      aria-label="Arcade game canvas"
      style={{
        imageRendering: 'pixelated', // Crisp pixels
        border: '2px solid #00FFFF',
      }}
    />
  );
};
