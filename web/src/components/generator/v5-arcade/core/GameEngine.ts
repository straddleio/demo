import { CRTEffect } from '../effects/CRTEffect';
import { FPSMonitor, PerformanceStats } from '../utils/performance';

type UpdateCallback = (deltaTime: number, totalTime: number) => void;

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private running: boolean = false;
  private lastFrameTime: number = 0;
  private totalTime: number = 0;
  private animationFrameId: number | null = null;
  private listeners: Map<string, UpdateCallback[]> = new Map();
  private crtEffect: CRTEffect;
  private fpsMonitor: FPSMonitor;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.crtEffect = new CRTEffect();
    this.fpsMonitor = new FPSMonitor(60);
  }

  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastFrameTime = performance.now();
    this.totalTime = 0;
    this.gameLoop();
  }

  public stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public on(event: string, callback: UpdateCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: UpdateCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, deltaTime: number, totalTime: number): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(deltaTime, totalTime));
    }
  }

  private gameLoop = (): void => {
    if (!this.running) {
      return;
    }

    const currentTime = performance.now();
    const deltaTimeMs = currentTime - this.lastFrameTime;
    const deltaTime = deltaTimeMs / 1000; // Convert to seconds

    this.lastFrameTime = currentTime;
    this.totalTime += deltaTime;

    // Update FPS monitoring
    this.fpsMonitor.update();

    // Clear canvas (skip if ctx or canvas is null, e.g., in test environment)
    if (this.ctx && this.ctx.canvas) {
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    // Emit update event for game logic
    this.emit('update', deltaTime, this.totalTime);

    // Apply CRT effects as post-processing
    if (this.ctx && this.ctx.canvas) {
      this.crtEffect.render(this.ctx);
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  public getPerformanceStats(): PerformanceStats {
    return this.fpsMonitor.getStats();
  }

  public resetPerformanceStats(): void {
    this.fpsMonitor.reset();
  }
}
