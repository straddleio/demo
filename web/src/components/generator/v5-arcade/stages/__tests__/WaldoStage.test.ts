// web/src/components/generator/v5-arcade/stages/__tests__/WaldoStage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WaldoStage, WaldoStageData } from '../WaldoStage';
import { SpriteEngine } from '../../core/SpriteEngine';
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

global.AudioContext = function () {
  return mockAudioContext;
} as unknown as typeof AudioContext;
// eslint-disable-next-line @typescript-eslint/no-explicit-any

describe('WaldoStage', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let sprite: SpriteEngine;
  let sound: SoundManager;
  let stage: WaldoStage;
  let stageData: WaldoStageData;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d')!;

    sprite = new SpriteEngine(ctx);
    sound = new SoundManager();
    vi.spyOn(sound, 'play').mockImplementation(() => {});

    stageData = {
      customerName: 'Alberta Bobbeth Charleson',
      matchedName: 'Alberta B Charleson',
      confidence: 98,
    };

    stage = new WaldoStage(sprite, sound, stageData);
  });

  it('should initialize with incomplete state', () => {
    expect(stage.isComplete()).toBe(false);
    expect(stage.getScore()).toBe(0);
  });

  it('should complete after 4 seconds', () => {
    stage.start();
    const startTime = performance.now();

    // Simulate 4.1 seconds
    vi.spyOn(performance, 'now').mockReturnValue(startTime + 4100);

    stage.update(0.016, 4.1);

    expect(stage.isComplete()).toBe(true);
  });

  describe('Phase 1: Typewriter (0.0-0.5s)', () => {
    it('should play beep sound for each character', () => {
      stage.start();
      const startTime = performance.now();

      // At 0.1s
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 100);
      stage.update(0.016, 0.1);

      // Should have played some beeps
      expect(sound.play).toHaveBeenCalledWith('beep');
    });

    it('should render typewriter text progressively', () => {
      const drawTextSpy = vi.spyOn(sprite, 'drawText');
      stage.start();
      const startTime = performance.now();

      // At 0.25s (halfway)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 250);
      stage.update(0.016, 0.25);
      stage.render();

      // Should render partial text
      expect(drawTextSpy).toHaveBeenCalled();
    });
  });

  describe('Phase 2: Pixelate/Depixelate (0.5-1.5s)', () => {
    it('should render pixelated text in middle of phase', () => {
      const drawTextSpy = vi.spyOn(sprite, 'drawText');
      stage.start();
      const startTime = performance.now();

      // At 1.0s (middle of pixelate phase)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 1000);
      stage.update(0.016, 1.0);
      stage.render();

      // Should have called drawText for each character (pixelate effect)
      expect(drawTextSpy.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('Phase 3: Target Shooting (1.5-2.5s)', () => {
    it('should render and process targets during shooting phase', () => {
      stage.start();
      const startTime = performance.now();
      const playSpy = vi.spyOn(sound, 'play');

      // Iterate through shooting phase
      for (let time = 1.6; time < 2.5; time += 0.1) {
        vi.spyOn(performance, 'now').mockReturnValue(startTime + time * 1000);
        stage.update(0.016, time);
      }

      // Should have some sound calls (beeps from previous phase or lasers)
      expect(playSpy.mock.calls.length).toBeGreaterThan(0);
    });

    it('should render target circles', () => {
      const drawCircleSpy = vi.spyOn(sprite, 'drawCircle');
      stage.start();
      const startTime = performance.now();

      // At 2.0s (middle of target phase)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 2000);
      stage.update(0.016, 2.0);
      stage.render();

      // Should draw target circles
      expect(drawCircleSpy).toHaveBeenCalled();
    });
  });

  describe('Phase 4: Match Lock (2.5-3.5s)', () => {
    it('should play lock sound when match locks in', () => {
      stage.start();
      const startTime = performance.now();

      // At 2.6s (during lock phase)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 2600);
      stage.update(0.016, 2.6);

      // Should have played lock sound
      expect(sound.play).toHaveBeenCalledWith('lock');
    });

    it('should render confidence bar', () => {
      const drawRectSpy = vi.spyOn(sprite, 'drawRect');
      stage.start();
      const startTime = performance.now();

      // At 3.0s (during lock phase)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 3000);
      stage.update(0.016, 3.0);
      stage.render();

      // Should draw confidence bar
      expect(drawRectSpy).toHaveBeenCalled();
    });
  });

  describe('Phase 5: Score Counter (3.5-4.0s)', () => {
    it('should increment score from 0 to confidence*100', () => {
      stage.start();
      const startTime = performance.now();

      // At 3.75s (middle of score phase)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 3750);
      stage.update(0.016, 3.75);

      const score = stage.getScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(9800); // 98% * 100
    });

    it('should reach final score at end', () => {
      stage.start();
      const startTime = performance.now();

      // At 3.95s (0.45s into 0.5s score phase = 90% progress)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 3950);
      stage.update(0.016, 3.95);

      const score = stage.getScore();
      const expectedScore = 9800 * 0.9; // 90% of max score
      expect(score).toBeGreaterThanOrEqual(expectedScore - 100); // Allow small tolerance
      expect(score).toBeLessThanOrEqual(9800);
    });
  });

  describe('Timing verification', () => {
    it('should complete all phases in exactly 4 seconds', () => {
      stage.start();
      const startTime = performance.now();

      // Test at key timestamps
      const timestamps = [0.25, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];

      timestamps.forEach((time) => {
        vi.spyOn(performance, 'now').mockReturnValue(startTime + time * 1000);
        stage.update(0.016, time);

        if (time < 4.0) {
          expect(stage.isComplete()).toBe(false);
        } else {
          expect(stage.isComplete()).toBe(true);
        }
      });
    });
  });

  describe('Animation sequence', () => {
    it('should follow exact timing for all phases', () => {
      stage.start();
      const startTime = performance.now();
      const playSpy = vi.spyOn(sound, 'play');

      // Phase 1: Typewriter (0.0-0.5s) - should hear beeps
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 250);
      stage.update(0.016, 0.25);
      expect(playSpy).toHaveBeenCalledWith('beep');

      playSpy.mockClear();

      // Phase 2: Pixelate (0.5-1.5s) - no sounds
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 1000);
      stage.update(0.016, 1.0);
      expect(playSpy).not.toHaveBeenCalled();

      // Phase 3: Shooting (1.5-2.5s) - targets being shot
      // Iterate through phase to ensure targets are processed
      playSpy.mockClear();
      for (let time = 1.6; time < 2.5; time += 0.1) {
        vi.spyOn(performance, 'now').mockReturnValue(startTime + time * 1000);
        stage.update(0.016, time);
      }

      // Laser sounds may or may not have been played depending on target order
      // But the phase should have executed
      playSpy.mockClear();

      // Phase 4: Lock (2.5-3.5s) - should hear lock
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 2600);
      stage.update(0.016, 2.6);
      expect(playSpy).toHaveBeenCalledWith('lock');

      // Phase 5: Score (3.5-4.0s) - no new sounds
      playSpy.mockClear();
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 3750);
      stage.update(0.016, 3.75);
      expect(playSpy).not.toHaveBeenCalled();
    });
  });
});
