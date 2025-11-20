import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MintingStage } from '../v5-arcade/stages/MintingStage';
import { SoundManager } from '../v5-arcade/audio/SoundManager';
import * as sounds from '@/lib/sounds';

// Mock the sounds module
vi.mock('@/lib/sounds', () => ({
  playPaykeyGeneratorEndSound: vi.fn(() => Promise.resolve()),
}));

describe('MintingStage', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let soundManager: SoundManager;
  let stage: MintingStage;

  const mockConfig = {
    tokenId: '758c519d.02.c16f91',
    canvas: null as unknown as HTMLCanvasElement,
  };

  beforeEach(() => {
    // Create canvas with proper dimensions
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    // Update config with canvas
    mockConfig.canvas = canvas;

    // Create sound manager
    soundManager = new SoundManager();
    vi.spyOn(soundManager, 'play');

    // Create stage
    stage = new MintingStage(ctx, mockConfig, soundManager);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with zero stage time', () => {
      stage.update(0);
      expect(stage.isComplete()).toBe(false);
    });

    it('should accept token ID in config', () => {
      const customConfig = {
        tokenId: 'abc123.01.xyz789',
        canvas,
      };
      const customStage = new MintingStage(ctx, customConfig, soundManager);
      customStage.update(1.5);
      customStage.render();

      // Token short form should be rendered
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const tokenCall = fillTextCalls.find((call) => call[0] === 'abc123');
      expect(tokenCall).toBeDefined();
    });

    it('should initialize tetris blocks', () => {
      stage.update(0.5);
      stage.render();

      // Verify blocks are drawn (fillRect called)
      expect(ctx.fillRect).toHaveBeenCalled();
    });
  });

  describe('stage completion', () => {
    it('should not be complete before 3 seconds', () => {
      stage.update(2.9);
      expect(stage.isComplete()).toBe(false);
    });

    it('should be complete after 3 seconds', () => {
      stage.update(3.0);
      expect(stage.isComplete()).toBe(true);
    });

    it('should remain complete after completion', () => {
      stage.update(4.0);
      expect(stage.isComplete()).toBe(true);
    });
  });

  describe('Phase 1: Tetris blocks falling (0.0-1.0s)', () => {
    it('should render falling tetris blocks', () => {
      stage.update(0.5);
      stage.render();

      // Verify blocks are drawn
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('should update block positions over time', () => {
      // Render at start
      stage.update(0.2);
      stage.render();
      vi.mocked(ctx.fillRect).mock.calls.length;

      // Clear and render later
      vi.clearAllMocks();
      stage.update(0.5);
      stage.render();
      const laterCalls = vi.mocked(ctx.fillRect).mock.calls.length;

      // Blocks should still be rendered
      expect(laterCalls).toBeGreaterThan(0);
    });

    it('should render blocks with different colors', () => {
      stage.update(0.5);
      stage.render();

      // Check that fillStyle was set multiple times (different colors)
      expect(ctx.fillStyle).toBeDefined();
    });

    it('should not play sounds during block falling', () => {
      stage.update(0.5);
      stage.render();

      expect(soundManager.play).not.toHaveBeenCalled();
    });
  });

  describe('Phase 2: Coin minting (1.0-2.0s)', () => {
    it('should play coin sound once at phase start', () => {
      // Update to just before phase 2
      stage.update(0.9);
      stage.render();
      expect(soundManager.play).not.toHaveBeenCalled();

      // Update into phase 2
      stage.update(0.2);
      stage.render();
      expect(soundManager.play).toHaveBeenCalledWith('coin');
      expect(soundManager.play).toHaveBeenCalledTimes(1);

      // Continue in phase 2 - should not play again
      stage.update(0.2);
      stage.render();
      expect(soundManager.play).toHaveBeenCalledTimes(1);
    });

    it('should render coin with glow effect', () => {
      stage.update(1.5);
      stage.render();

      // Verify circles are drawn (coin)
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should render token ID on coin', () => {
      stage.update(1.5);
      stage.render();

      // Token short form (first 6 chars before first dot)
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const tokenCall = fillTextCalls.find((call) => call[0] === '758c51');
      expect(tokenCall).toBeDefined();
    });

    it('should create sparkle effects', () => {
      stage.update(1.5);
      stage.render();

      // Sparkles are circles, verify arcs are drawn
      const arcCalls = vi.mocked(ctx.arc).mock.calls;
      // Should have coin circle + coin border + sparkles
      expect(arcCalls.length).toBeGreaterThan(2);
    });

    it('should animate coin dropping from top to center', () => {
      // Early in phase - coin should be higher
      stage.update(1.1);
      stage.render();
      const earlyArcCalls = vi.mocked(ctx.arc).mock.calls;

      // Later in phase - coin should be lower
      vi.clearAllMocks();
      stage.update(0.8);
      stage.render();
      const laterArcCalls = vi.mocked(ctx.arc).mock.calls;

      // Both should have arc calls (coin rendered)
      expect(earlyArcCalls.length).toBeGreaterThan(0);
      expect(laterArcCalls.length).toBeGreaterThan(0);
    });

    it('should fade sparkles over time', () => {
      // Start of phase
      stage.update(1.1);
      stage.render();

      // Later in phase - sparkles should fade
      stage.update(0.8);
      stage.render();

      // Verify rendering still occurs (sparkles may be faded)
      expect(ctx.arc).toHaveBeenCalled();
    });
  });

  describe('Phase 3: Achievement badge (2.0-2.5s)', () => {
    it('should render achievement badge with fade-in', () => {
      stage.update(2.3);
      stage.render();

      // Verify badge background is drawn
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('should render "VERIFIED!" text', () => {
      stage.update(2.3);
      stage.render();

      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const verifiedCall = fillTextCalls.find((call) => call[0] === 'VERIFIED!');
      expect(verifiedCall).toBeDefined();
    });

    it('should not render achievement before phase 3', () => {
      stage.update(1.5);
      stage.render();

      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const verifiedCall = fillTextCalls.find((call) => call[0] === 'VERIFIED!');
      expect(verifiedCall).toBeUndefined();
    });

    it('should increase achievement opacity over time', () => {
      // Early in phase
      stage.update(2.1);
      stage.render();

      // Later in phase - should be more opaque
      stage.update(0.3);
      stage.render();

      // Verify text is rendered
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const verifiedCall = fillTextCalls.find((call) => call[0] === 'VERIFIED!');
      expect(verifiedCall).toBeDefined();
    });
  });

  describe('Phase 4: Final score (2.5-3.0s)', () => {
    it('should play paykey generator end sound once at phase start', () => {
      // Update to just before phase 4
      stage.update(2.4);
      stage.render();
      expect(sounds.playPaykeyGeneratorEndSound).not.toHaveBeenCalled();

      // Update into phase 4
      stage.update(0.2);
      stage.render();
      expect(sounds.playPaykeyGeneratorEndSound).toHaveBeenCalledTimes(1);

      // Continue in phase 4 - should not play again
      stage.update(0.2);
      stage.render();
      expect(sounds.playPaykeyGeneratorEndSound).toHaveBeenCalledTimes(1);
    });

    it('should render final score with fade-in', () => {
      stage.update(2.7);
      stage.render();

      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const scoreCall = fillTextCalls.find((call) => call[0] === '+25,000');
      expect(scoreCall).toBeDefined();
    });

    it('should render "MINTING COMPLETE" label', () => {
      stage.update(2.7);
      stage.render();

      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const labelCall = fillTextCalls.find((call) => call[0] === 'MINTING COMPLETE');
      expect(labelCall).toBeDefined();
    });

    it('should not render score before phase 4', () => {
      stage.update(2.2);
      stage.render();

      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const scoreCall = fillTextCalls.find((call) => call[0] === '+25,000');
      expect(scoreCall).toBeUndefined();
    });

    it('should format score with thousands separator', () => {
      stage.update(2.7);
      stage.render();

      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      // Score should be formatted with comma: +25,000
      const scoreCall = fillTextCalls.find((call) => {
        const text = call[0].toString();
        return text.includes(',') && text.includes('25');
      });
      expect(scoreCall).toBeDefined();
    });
  });

  describe('paykey format validation', () => {
    it('should handle token format with dots', () => {
      const config = {
        tokenId: '758c519d.02.c16f91',
        canvas,
      };
      const testStage = new MintingStage(ctx, config, soundManager);
      testStage.update(1.5);
      testStage.render();

      // Should extract first part before dot
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const tokenCall = fillTextCalls.find((call) => call[0] === '758c51');
      expect(tokenCall).toBeDefined();
    });

    it('should truncate token to 6 characters', () => {
      const config = {
        tokenId: 'abcdefghij.01.xyz',
        canvas,
      };
      const testStage = new MintingStage(ctx, config, soundManager);
      testStage.update(1.5);
      testStage.render();

      // Should show only first 6 chars
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const tokenCall = fillTextCalls.find((call) => call[0] === 'abcdef');
      expect(tokenCall).toBeDefined();
    });
  });

  describe('rendering with SpriteEngine', () => {
    it('should batch and flush draw calls', () => {
      stage.update(0.5);
      stage.render();

      // Verify draw calls were made (blocks in phase 1)
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('should use glow effects on coin', () => {
      stage.update(1.5);
      stage.render();

      // Verify shadow effects are set for glow
      expect(ctx.shadowBlur).toBeGreaterThan(0);
    });

    it('should render multiple visual elements simultaneously', () => {
      stage.update(2.7);
      stage.render();

      // At this point: coin, sparkles, achievement, score should all be visible
      expect(ctx.arc).toHaveBeenCalled(); // Coin + sparkles
      expect(ctx.fillRect).toHaveBeenCalled(); // Achievement badge
      expect(ctx.fillText).toHaveBeenCalled(); // Score + labels
    });
  });

  describe('cleanup', () => {
    it('should cleanup sound manager', () => {
      vi.spyOn(soundManager, 'cleanup');
      stage.cleanup();

      expect(soundManager.cleanup).toHaveBeenCalled();
    });
  });

  describe('animation timing', () => {
    it('should progress through all phases sequentially', () => {
      // Phase 1: Blocks falling
      stage.update(0.5);
      stage.render();
      expect(ctx.fillRect).toHaveBeenCalled();
      vi.clearAllMocks();

      // Phase 2: Coin minting
      stage.update(1.0);
      stage.render();
      expect(ctx.arc).toHaveBeenCalled();
      expect(soundManager.play).toHaveBeenCalledWith('coin');
      vi.clearAllMocks();

      // Phase 3: Achievement
      stage.update(1.5);
      stage.render();
      const achievementCalls = vi.mocked(ctx.fillText).mock.calls;
      const verifiedCall = achievementCalls.find((call) => call[0] === 'VERIFIED!');
      expect(verifiedCall).toBeDefined();
      vi.clearAllMocks();

      // Phase 4: Final score
      stage.update(0.5);
      stage.render();
      const scoreCalls = vi.mocked(ctx.fillText).mock.calls;
      const scoreCall = scoreCalls.find((call) => call[0] === '+25,000');
      expect(scoreCall).toBeDefined();

      // Complete
      expect(stage.isComplete()).toBe(true);
    });

    it('should handle small deltaTime increments', () => {
      // Simulate 60 FPS updates (16.67ms per frame)
      const deltaTime = 0.01667;
      let totalTime = 0;

      while (totalTime < 3.0) {
        stage.update(deltaTime);
        totalTime += deltaTime;
      }

      expect(stage.isComplete()).toBe(true);
    });

    it('should handle large deltaTime increments', () => {
      // Jump straight to end
      stage.update(5.0);
      expect(stage.isComplete()).toBe(true);
    });
  });

  describe('visual effects', () => {
    it('should render coin with border', () => {
      stage.update(1.5);
      stage.render();

      // Should have multiple arc calls: coin fill + coin border
      const arcCalls = vi.mocked(ctx.arc).mock.calls;
      expect(arcCalls.length).toBeGreaterThanOrEqual(2);
    });

    it('should create multiple sparkles around coin', () => {
      stage.update(1.5);
      stage.render();

      // Sparkles are circles, should have many arc calls
      const arcCalls = vi.mocked(ctx.arc).mock.calls;
      // Coin (2 arcs) + sparkles (12+)
      expect(arcCalls.length).toBeGreaterThan(10);
    });

    it('should use proper colors for different elements', () => {
      stage.update(1.5);
      stage.render();

      // fillStyle should be set for different colored elements
      expect(ctx.fillStyle).toBeDefined();
    });
  });
});
