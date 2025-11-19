// web/src/components/generator/v5-arcade/stages/__tests__/MintingStage.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MintingStage } from '../MintingStage';

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

describe('MintingStage', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let stage: MintingStage;

  beforeEach(() => {
    vi.clearAllMocks();
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d')!;

    stage = new MintingStage(ctx, {
      tokenId: '758c519d.02.c16f91',
      canvas,
    });
  });

  afterEach(() => {
    stage.cleanup();
  });

  describe('Phase 1: Tetris Blocks (0.0-1.0s)', () => {
    it('should render falling Tetris blocks', () => {
      const fillRectSpy = vi.spyOn(ctx, 'fillRect');

      stage.update(0.5); // 0.5s into animation
      stage.render();

      // Should have called fillRect for Tetris blocks
      expect(fillRectSpy).toHaveBeenCalled();
      expect(fillRectSpy.mock.calls.length).toBeGreaterThanOrEqual(6);
    });

    it('should not be complete before 3 seconds', () => {
      stage.update(0.5);
      expect(stage.isComplete()).toBe(false);
    });
  });

  describe('Phase 2: Coin Minting (1.0-2.0s)', () => {
    it('should play coin sound at 1.0s', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const soundManagerSpy = vi.spyOn((stage as any).soundManager, 'play');

      // Before 1.0s - no coin sound
      stage.update(0.9);
      stage.render();
      expect(soundManagerSpy).not.toHaveBeenCalledWith('coin');

      // At 1.0s - coin sound plays
      stage.update(0.2); // Now at 1.1s total
      stage.render();
      expect(soundManagerSpy).toHaveBeenCalledWith('coin');
    });

    it('should render coin with sparkle effect', () => {
      const arcSpy = vi.spyOn(ctx, 'arc');

      stage.update(1.5); // 1.5s into animation
      stage.render();

      // Should have called arc for coin and sparkles
      expect(arcSpy).toHaveBeenCalled();
      expect(arcSpy.mock.calls.length).toBeGreaterThan(1); // Coin + sparkles
    });

    it('should display token ID on coin', () => {
      const fillTextSpy = vi.spyOn(ctx, 'fillText');

      stage.update(1.5);
      stage.render();

      // Should display truncated token ID
      const tokenCalls = fillTextSpy.mock.calls.find((call) =>
        call[0]?.toString().includes('758c51')
      );
      expect(tokenCalls).toBeDefined();
    });
  });

  describe('Phase 3: Achievement Badge (2.0-2.5s)', () => {
    it('should show achievement badge with fade-in', () => {
      const fillTextSpy = vi.spyOn(ctx, 'fillText');

      stage.update(2.3); // 2.3s into animation
      stage.render();

      // Should display "VERIFIED!" badge
      const badgeCalls = fillTextSpy.mock.calls.find((call) => call[0] === 'VERIFIED!');
      expect(badgeCalls).toBeDefined();
    });

    it('should fade in achievement alpha', () => {
      stage.update(2.0); // Start of phase 3
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alpha1 = (stage as any).achievementAlpha;

      stage.update(0.25); // Mid phase 3 (2.25s total)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alpha2 = (stage as any).achievementAlpha;

      expect(alpha2).toBeGreaterThan(alpha1);
      expect(alpha2).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Phase 4: Final Score (2.5-3.0s)', () => {
    it('should play fanfare sound at 2.5s', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const soundManagerSpy = vi.spyOn((stage as any).soundManager, 'play');

      stage.update(2.4);
      stage.render();
      expect(soundManagerSpy).not.toHaveBeenCalledWith('fanfare');

      stage.update(0.2); // Now at 2.6s total
      stage.render();
      expect(soundManagerSpy).toHaveBeenCalledWith('fanfare');
    });

    it('should display final score of +25,000', () => {
      const fillTextSpy = vi.spyOn(ctx, 'fillText');

      stage.update(2.8); // 2.8s into animation
      stage.render();

      // Should display "+25,000" score
      const scoreCalls = fillTextSpy.mock.calls.find((call) =>
        call[0]?.toString().includes('25,000')
      );
      expect(scoreCalls).toBeDefined();
    });

    it('should display "MINTING COMPLETE" label', () => {
      const fillTextSpy = vi.spyOn(ctx, 'fillText');

      stage.update(2.8);
      stage.render();

      const labelCalls = fillTextSpy.mock.calls.find((call) => call[0] === 'MINTING COMPLETE');
      expect(labelCalls).toBeDefined();
    });

    it('should fade in score alpha', () => {
      stage.update(2.5); // Start of phase 4
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alpha1 = (stage as any).scoreAlpha;

      stage.update(0.25); // Mid phase 4 (2.75s total)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alpha2 = (stage as any).scoreAlpha;

      expect(alpha2).toBeGreaterThan(alpha1);
      expect(alpha2).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Stage Completion', () => {
    it('should be complete after 3.0 seconds', () => {
      stage.update(3.0);
      expect(stage.isComplete()).toBe(true);
    });

    it('should complete total animation in 2-3 seconds', () => {
      // Test that stage duration meets PRD requirement
      stage.update(2.5);
      expect(stage.isComplete()).toBe(false);

      stage.update(0.5); // Total 3.0s
      expect(stage.isComplete()).toBe(true);

      // Verify total time is within 2-3 second requirement
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalTime = (stage as any).stageTime;
      expect(totalTime).toBeGreaterThanOrEqual(2.0);
      expect(totalTime).toBeLessThanOrEqual(3.0);
    });
  });

  describe('Animation Timing', () => {
    it('should have correct phase transitions', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stageAny = stage as any;

      // Phase 1: Tetris blocks (0.0-1.0s)
      stage.update(0.5);
      expect(stageAny.coinMintPlayed).toBe(false);

      // Phase 2: Coin minting (1.0-2.0s)
      stage.update(0.6); // Now 1.1s
      expect(stageAny.coinMintPlayed).toBe(true);
      expect(stageAny.achievementAlpha).toBe(0);

      // Phase 3: Achievement (2.0-2.5s)
      stage.update(1.0); // Now 2.1s
      expect(stageAny.achievementAlpha).toBeGreaterThan(0);
      expect(stageAny.fanfarePlayed).toBe(false);

      // Phase 4: Final score (2.5-3.0s)
      stage.update(0.5); // Now 2.6s
      expect(stageAny.fanfarePlayed).toBe(true);
      expect(stageAny.scoreAlpha).toBeGreaterThan(0);
    });
  });
});
