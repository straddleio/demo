// web/src/components/generator/v5-arcade/core/__tests__/SpriteEngine.test.ts
import { vi } from 'vitest';
import { SpriteEngine } from '../SpriteEngine';

describe('SpriteEngine', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let engine: SpriteEngine;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d')!;
    engine = new SpriteEngine(ctx);
  });

  it('should draw text with arcade font', () => {
    const fillTextSpy = vi.spyOn(ctx, 'fillText');

    engine.drawText('HELLO', 100, 100, '#00FFFF', 24);
    engine.flush(); // Flush batched draw calls

    expect(fillTextSpy).toHaveBeenCalledWith('HELLO', 100, 100);
    expect(ctx.fillStyle).toBe('#00ffff');
    expect(ctx.font).toContain('Press Start 2P');
  });

  it('should draw rectangle with neon glow', () => {
    const fillRectSpy = vi.spyOn(ctx, 'fillRect');
    const shadowColor = vi.spyOn(ctx, 'shadowColor', 'set');

    engine.drawRect(50, 50, 100, 100, '#FF00FF', true);
    engine.flush(); // Flush batched draw calls

    expect(shadowColor).toHaveBeenCalledWith('#FF00FF');
    expect(fillRectSpy).toHaveBeenCalledWith(50, 50, 100, 100);
  });

  it('should draw circle sprite', () => {
    const arcSpy = vi.spyOn(ctx, 'arc');

    engine.drawCircle(200, 200, 50, '#FFFF00');
    engine.flush(); // Flush batched draw calls

    expect(arcSpy).toHaveBeenCalled();
  });
});
