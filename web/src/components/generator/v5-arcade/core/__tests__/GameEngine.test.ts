import { vi } from 'vitest';
import { GameEngine } from '../GameEngine';

describe('GameEngine', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let engine: GameEngine;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d')!;
    engine = new GameEngine(ctx);
  });

  afterEach(() => {
    engine.stop();
  });

  it('should start and run update loop', async () => {
    const updateSpy = vi.fn();
    engine.on('update', updateSpy);

    engine.start();

    // Wait for at least 2 frames
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(updateSpy).toHaveBeenCalled();
    expect(updateSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('should provide deltaTime in seconds', async () => {
    let deltaTime = 0;
    engine.on('update', (dt: number) => {
      deltaTime = dt;
    });

    engine.start();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(deltaTime).toBeGreaterThan(0);
    expect(deltaTime).toBeLessThan(0.1); // Should be around 0.016 for 60fps
  });

  it('should stop the game loop', async () => {
    const updateSpy = vi.fn();
    engine.on('update', updateSpy);

    engine.start();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const callCountBeforeStop = updateSpy.mock.calls.length;
    engine.stop();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(updateSpy.mock.calls.length).toBe(callCountBeforeStop);
  });
});
