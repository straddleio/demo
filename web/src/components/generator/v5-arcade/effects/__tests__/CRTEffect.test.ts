import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CRTEffect } from '../CRTEffect';

describe('CRTEffect', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let effect: CRTEffect;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;

    // Mock context
    ctx = {
      canvas: canvas,
      fillStyle: '',
      fillRect: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(640 * 480 * 4),
      }),
    } as unknown as CanvasRenderingContext2D;

    effect = new CRTEffect();
  });

  it('should render scanlines at correct interval', () => {
    effect.render(ctx);

    // Check that fillRect was called multiple times (for scanlines)
    expect(ctx.fillRect).toHaveBeenCalled();

    // Get all calls to fillRect
    const calls = (ctx.fillRect as any).mock.calls;

    // First scanline should be at y=0
    expect(calls[0][1]).toBe(0);
    // Second scanline should be at y=2 (interval 2)
    expect(calls[1][1]).toBe(2);

    // Check color (opacity)
    expect(ctx.fillStyle).toContain('rgba(0, 0, 0,');
  });
});
