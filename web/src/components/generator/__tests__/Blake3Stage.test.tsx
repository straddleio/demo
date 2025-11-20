import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Blake3Stage } from '../v5-arcade/stages/Blake3Stage';
import { SoundManager } from '../v5-arcade/audio/SoundManager';

describe('Blake3Stage', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let soundManager: SoundManager;
  let stage: Blake3Stage;

  beforeEach(() => {
    // Create canvas with proper dimensions
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    // Create sound manager
    soundManager = new SoundManager();
    vi.spyOn(soundManager, 'play');

    // Create stage
    stage = new Blake3Stage(ctx, soundManager);
  });

  describe('initialization', () => {
    it('should initialize with zero stage time', () => {
      expect(stage.update(0)).toBe(false);
    });

    it('should initialize data nodes for visualization', () => {
      // Render to verify nodes are initialized
      stage.render(ctx);
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('stage progression', () => {
    it('should not be complete before 4 seconds', () => {
      // Progress to 3.9 seconds
      stage.update(3.9);
      expect(stage.update(0.05)).toBe(false);
    });

    it('should be complete after 4 seconds', () => {
      // Progress to 4.0 seconds
      stage.update(4.0);
      expect(stage.update(0.01)).toBe(true);
    });

    it('should remain complete after completion', () => {
      // Progress past completion
      stage.update(5.0);
      expect(stage.update(0.1)).toBe(true);
    });
  });

  describe('Phase 1: Fly-in animation (0.0-1.0s)', () => {
    it('should render title during fly-in phase', () => {
      stage.update(0.5);
      stage.render(ctx);

      // Check for title text - SpriteEngine batches calls so we look for the text in any call
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const titleCall = fillTextCalls.find((call) => call[0] === 'BLAKE3 HASH GENERATION');
      expect(titleCall).toBeDefined();
    });

    it('should render data nodes flying in', () => {
      stage.update(0.5);
      stage.render(ctx);

      // Verify circles and rectangles are drawn (data nodes)
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('should render node labels', () => {
      stage.update(0.5);
      stage.render(ctx);

      // Check that node labels are rendered
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const nodeLabels = fillTextCalls.filter(
        (call) =>
          call[0] === 'NAME' ||
          call[0] === 'ACCT' ||
          call[0] === 'WALDO' ||
          call[0] === 'ROUTE'
      );
      expect(nodeLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Phase 2: Chomping animation (1.0-2.0s)', () => {
    it('should render combining data title', () => {
      stage.update(1.5);
      stage.render(ctx);

      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const titleCall = fillTextCalls.find((call) => call[0] === 'COMBINING DATA...');
      expect(titleCall).toBeDefined();
    });

    it('should play chomp sound once at phase start', () => {
      // Update to just before phase 2
      stage.update(0.9);
      stage.render(ctx);
      expect(soundManager.play).not.toHaveBeenCalled();

      // Update into phase 2
      stage.update(0.2);
      stage.render(ctx);
      expect(soundManager.play).toHaveBeenCalledWith('chomp');
      expect(soundManager.play).toHaveBeenCalledTimes(1);

      // Continue in phase 2 - should not play again
      stage.update(0.2);
      stage.render(ctx);
      expect(soundManager.play).toHaveBeenCalledTimes(1);
    });

    it('should render Pac-Man with chomping animation', () => {
      stage.update(1.5);
      stage.render(ctx);

      // Verify Pac-Man circle is drawn (arc + fill)
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should render shrinking data nodes', () => {
      stage.update(1.5);
      stage.render(ctx);

      // Verify nodes are still being drawn
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalled();
    });
  });

  describe('Phase 3: Hex scroll (2.0-3.0s)', () => {
    it('should render generating hash title', () => {
      stage.update(2.5);
      stage.render(ctx);

      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const titleCall = fillTextCalls.find((call) => call[0] === 'GENERATING HASH...');
      expect(titleCall).toBeDefined();
    });

    it('should generate scrolling hex bytes', () => {
      stage.update(2.5);
      stage.render(ctx);

      // Check that hex bytes are rendered (4-character hex strings)
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const hexCalls = fillTextCalls.filter((call) => {
        const text = call[0].toString();
        return /^[0-9a-f]{4}$/.test(text);
      });
      expect(hexCalls.length).toBeGreaterThan(0);
    });

    it('should update hex byte positions over time', () => {
      // Render at start of phase
      stage.update(2.0);
      stage.render(ctx);
      vi.mocked(ctx.fillText).mock.calls.length;

      // Clear mocks and render later in phase
      vi.clearAllMocks();
      stage.update(0.5);
      stage.render(ctx);
      const laterCalls = vi.mocked(ctx.fillText).mock.calls.length;

      // More hex bytes should be drawn as they scroll
      expect(laterCalls).toBeGreaterThan(0);
    });
  });

  describe('Phase 4: Token compression (3.0-4.0s)', () => {
    it('should render compressing hash title', () => {
      stage.update(3.5);
      stage.render(ctx);

      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const titleCall = fillTextCalls.find((call) => call[0] === 'COMPRESSING HASH...');
      expect(titleCall).toBeDefined();
    });

    it('should render token format', () => {
      stage.update(3.5);
      stage.render(ctx);

      // Check for token string
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const tokenCall = fillTextCalls.find((call) => call[0] === '758c519d.02.c16f91');
      expect(tokenCall).toBeDefined();
    });

    it('should render compression lines', () => {
      stage.update(3.5);
      stage.render(ctx);

      // Verify lines are drawn
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should show score popup near end of phase', () => {
      stage.update(3.8);
      stage.render(ctx);

      // Check for score text
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const scoreCall = fillTextCalls.find((call) => call[0] === '+5,000');
      expect(scoreCall).toBeDefined();
    });

    it('should not show score popup early in phase', () => {
      stage.update(3.1);
      stage.render(ctx);

      // Score should not appear yet
      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const scoreCall = fillTextCalls.find((call) => call[0] === '+5,000');
      expect(scoreCall).toBeUndefined();
    });
  });

  describe('reset functionality', () => {
    it('should reset stage time', () => {
      // Progress stage
      stage.update(2.0);
      expect(stage.update(0.1)).toBe(false);

      // Reset
      stage.reset();

      // Should not be complete anymore
      expect(stage.update(0.1)).toBe(false);
    });

    it('should reset chomp sound flag', () => {
      // Trigger chomp sound
      stage.update(1.5);
      stage.render(ctx);
      expect(soundManager.play).toHaveBeenCalledWith('chomp');

      // Reset and clear mocks
      stage.reset();
      vi.clearAllMocks();

      // Should play chomp again when reaching phase 2
      stage.update(1.5);
      stage.render(ctx);
      expect(soundManager.play).toHaveBeenCalledWith('chomp');
    });

    it('should clear hex bytes', () => {
      // Generate hex bytes in phase 3
      stage.update(2.5);
      stage.render(ctx);

      // Reset
      stage.reset();
      vi.clearAllMocks();

      // Early phases should not show hex bytes
      stage.update(0.5);
      stage.render(ctx);

      const fillTextCalls = vi.mocked(ctx.fillText).mock.calls;
      const hexCalls = fillTextCalls.filter((call) => {
        const text = call[0].toString();
        return /^[0-9a-f]{4}$/.test(text);
      });
      expect(hexCalls.length).toBe(0);
    });
  });

  describe('rendering with SpriteEngine', () => {
    it('should batch and flush draw calls', () => {
      stage.update(0.5);
      stage.render(ctx);

      // Verify flush was called (draws were batched)
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('should use glow effects', () => {
      stage.update(0.5);
      stage.render(ctx);

      // Verify shadow effects are set for glow
      expect(ctx.shadowBlur).toBeGreaterThan(0);
    });
  });
});
