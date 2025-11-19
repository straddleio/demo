import { vi } from 'vitest';
import { CRTEffect } from '../CRTEffect';

describe('CRTEffect', () => {
  let canvas: HTMLCanvasElement;
  let effect: CRTEffect;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    effect = new CRTEffect();
  });

  it('should create CRTEffect instance', () => {
    expect(effect).toBeInstanceOf(CRTEffect);
  });

  it('should have render method', () => {
    expect(typeof effect.render).toBe('function');
  });

  it('should render without error when ctx is provided', () => {
    // Mock context to avoid jsdom limitations
    const mockCtx = {
      canvas: { width: 640, height: 480 },
      fillStyle: '',
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    expect(() => effect.render(mockCtx)).not.toThrow();
    expect(mockCtx.fillRect).toHaveBeenCalled();
  });
});
