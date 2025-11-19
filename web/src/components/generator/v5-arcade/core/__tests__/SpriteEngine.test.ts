import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpriteEngine } from '../SpriteEngine';

describe('SpriteEngine', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let engine: SpriteEngine;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    // Mock context methods used by SpriteEngine
    ctx = {
      canvas: canvas,
      fillStyle: '',
      strokeStyle: '',
      font: '',
      shadowColor: '',
      shadowBlur: 0,
      textAlign: '',
      textBaseline: '',
      lineWidth: 1,
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    engine = new SpriteEngine(ctx);
  });

  it('should draw text with arcade font', () => {
    engine.drawText('HELLO', 100, 100, '#00FFFF', 24);

    expect(ctx.fillText).toHaveBeenCalledWith('HELLO', 100, 100);
    expect(ctx.fillStyle).toBe('#00FFFF');
    expect(ctx.font).toContain('Press Start 2P');
  });

  it('should draw rectangle with neon glow', () => {
    engine.drawRect(50, 50, 100, 100, '#FF00FF', true);

    expect(ctx.shadowColor).toBe('#FF00FF');
    expect(ctx.fillRect).toHaveBeenCalledWith(50, 50, 100, 100);
  });

  it('should draw circle sprite', () => {
    engine.drawCircle(200, 200, 50, '#FFFF00');

    expect(ctx.arc).toHaveBeenCalled();
  });
});
