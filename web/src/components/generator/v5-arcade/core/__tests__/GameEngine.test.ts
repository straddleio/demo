import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameEngine } from '../GameEngine';

describe('GameEngine', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let engine: GameEngine;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;

    // Mock AudioContext
    class MockAudioContext {
      createOscillator = vi.fn().mockReturnValue({
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        type: 'sine',
      });
      createGain = vi.fn().mockReturnValue({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      });
      currentTime = 0;
      destination = {};
      close = vi.fn();
      state = 'running';
      resume = vi.fn();
    }
    global.AudioContext = MockAudioContext as any;

    // Mock context
    ctx = {
      canvas: canvas,
      // ...
      fillStyle: '',
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 0 }),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      shadowColor: '',
      shadowBlur: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      lineWidth: 1,
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(640 * 480 * 4),
      }),
    } as unknown as CanvasRenderingContext2D;

    engine = new GameEngine(ctx);
  });

  afterEach(() => {
    engine.stop();
    vi.restoreAllMocks();
  });

  it('should start and run update loop', async () => {
    const updateSpy = vi.fn();
    engine.on('update', updateSpy);

    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      setTimeout(() => cb(performance.now()), 16); // Simulate ~60fps
      return 1;
    });

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

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      setTimeout(() => cb(performance.now()), 16);
      return 1;
    });

    engine.start();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(deltaTime).toBeGreaterThan(0);
    expect(deltaTime).toBeLessThan(0.1); // Should be around 0.016 for 60fps
  });

  it('should stop the game loop', async () => {
    const updateSpy = vi.fn();
    engine.on('update', updateSpy);

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      setTimeout(() => cb(performance.now()), 16);
      return 1;
    });
    const cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame');

    engine.start();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const callCountBeforeStop = updateSpy.mock.calls.length;
    engine.stop();

    expect(cancelRafSpy).toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 50));
    // Should not have increased significantly (maybe 1 pending callback)
    expect(updateSpy.mock.calls.length).toBe(callCountBeforeStop);
  });
});
