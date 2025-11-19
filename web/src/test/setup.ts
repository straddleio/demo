import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill ResizeObserver for jsdom environment
// Required for Three.js Canvas and react-use-measure to work in tests
global.ResizeObserver = class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
} as typeof ResizeObserver;

// Mock HTMLCanvasElement.getContext for 2D canvas tests
// Required for SpriteEngine and other canvas-based components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
HTMLCanvasElement.prototype.getContext = function (contextId: string): any {
  if (contextId === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeRect: vi.fn(),
      strokeText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      globalAlpha: 1,
      canvas: { width: 640, height: 480 },
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
};

// Mock AudioContext for SoundManager tests
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
global.AudioContext = class MockAudioContext {
  currentTime = 0;
  destination = {};

  createOscillator(): unknown {
    return {
      type: 'square',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  createGain(): unknown {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;
