// web/src/components/generator/v5-arcade/stages/__tests__/Blake3Stage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Blake3Stage } from '../Blake3Stage';
import { SoundManager } from '../../audio/SoundManager';

// Mock AudioContext
const mockOscillator = {
  type: 'sine' as OscillatorType,
  frequency: {
    setValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGainNode = {
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
};

const mockAudioContext = {
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGainNode),
  close: vi.fn(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.AudioContext = function () {
  return mockAudioContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe('Blake3Stage', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let soundManager: SoundManager;
  let stage: Blake3Stage;

  beforeEach(() => {
    vi.clearAllMocks();
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d')!;

    // Add missing canvas methods for jsdom
    if (!ctx.closePath) {
      ctx.closePath = vi.fn();
    }
    if (!ctx.lineTo) {
      ctx.lineTo = vi.fn();
    }
    if (!ctx.arc) {
      ctx.arc = vi.fn();
    }

    soundManager = new SoundManager();
    stage = new Blake3Stage(ctx, soundManager);
  });

  describe('Stage Timing', () => {
    it('should not complete before 4 seconds', () => {
      // Update for 3.9 seconds
      for (let i = 0; i < 39; i++) {
        const complete = stage.update(0.1);
        expect(complete).toBe(false);
      }
    });

    it('should complete after 4 seconds', () => {
      // Update for 4.0 seconds
      for (let i = 0; i < 40; i++) {
        stage.update(0.1);
      }
      const complete = stage.update(0.1);
      expect(complete).toBe(true);
    });
  });

  describe('Animation Phases', () => {
    it('should render data fly-in phase (0.0-1.0s)', () => {
      stage.update(0.5); // Middle of fly-in phase

      const fillTextSpy = vi.spyOn(ctx, 'fillText');
      stage.render(ctx);

      // Should have title text indicating Blake3 hash generation phase
      expect(fillTextSpy).toHaveBeenCalled();
      const titleCall = fillTextSpy.mock.calls.find((call) => call[0].includes('BLAKE3'));
      expect(titleCall).toBeDefined();
    });

    it('should render chomping phase (1.0-2.0s)', () => {
      const playSpy = vi.spyOn(soundManager, 'play');
      const fillTextSpy = vi.spyOn(ctx, 'fillText');

      stage.update(1.5); // Middle of chomping phase
      stage.render(ctx);

      // Should play chomp sound
      expect(playSpy).toHaveBeenCalledWith('chomp');

      // Should have "COMBINING DATA" text
      expect(fillTextSpy).toHaveBeenCalled();
      const combiningCall = fillTextSpy.mock.calls.find((call) => call[0].includes('COMBINING'));
      expect(combiningCall).toBeDefined();
    });

    it('should render hex scroll phase (2.0-3.0s)', () => {
      const fillTextSpy = vi.spyOn(ctx, 'fillText');

      stage.update(2.5); // Middle of hex scroll phase
      stage.render(ctx);

      // Should have "GENERATING HASH" text
      expect(fillTextSpy).toHaveBeenCalled();
      const generatingCall = fillTextSpy.mock.calls.find((call) => call[0].includes('GENERATING'));
      expect(generatingCall).toBeDefined();

      // Should have hex bytes rendered
      const hexCalls = fillTextSpy.mock.calls.filter((call) => {
        const text = call[0];
        return /^[0-9a-f]{4}$/i.test(text);
      });
      expect(hexCalls.length).toBeGreaterThan(0);
    });

    it('should render token compression phase (3.0-4.0s)', () => {
      const fillTextSpy = vi.spyOn(ctx, 'fillText');
      const strokeSpy = vi.spyOn(ctx, 'stroke');

      stage.update(3.5); // Middle of compression phase
      stage.render(ctx);

      // Should have "COMPRESSING HASH" text
      expect(fillTextSpy).toHaveBeenCalled();
      const compressingCall = fillTextSpy.mock.calls.find((call) =>
        call[0].includes('COMPRESSING')
      );
      expect(compressingCall).toBeDefined();

      // Should have token text
      const tokenCall = fillTextSpy.mock.calls.find((call) => call[0].includes('.'));
      expect(tokenCall).toBeDefined();

      // Should have compression lines
      expect(strokeSpy).toHaveBeenCalled();
    });

    it('should show score popup near end of compression phase', () => {
      const fillTextSpy = vi.spyOn(ctx, 'fillText');

      stage.update(3.8); // Near end of compression phase (progress > 0.7)
      stage.render(ctx);

      // Should have "+5,000" score text
      const scoreCall = fillTextSpy.mock.calls.find((call) => call[0].includes('+5,000'));
      expect(scoreCall).toBeDefined();
    });
  });

  describe('Reset', () => {
    it('should reset stage to initial state', () => {
      // Run through entire stage
      stage.update(4.0);

      // Reset
      stage.reset();

      // Should not be complete
      const complete = stage.update(0.1);
      expect(complete).toBe(false);
    });
  });

  describe('Sound Integration', () => {
    it('should only play chomp sound once during chomping phase', () => {
      const playSpy = vi.spyOn(soundManager, 'play');

      // Update multiple times during chomping phase
      stage.update(1.1);
      stage.render(ctx);
      stage.update(0.3);
      stage.render(ctx);
      stage.update(0.3);
      stage.render(ctx);

      // Should only play chomp once
      expect(playSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledWith('chomp');
    });
  });
});
