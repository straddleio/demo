// web/src/components/generator/v5-arcade/utils/performance.ts

export interface PerformanceStats {
  avgFPS: number;
  minFPS: number;
  maxFPS: number;
  frameTimeAvg: number; // milliseconds
  frameTimeMin: number;
  frameTimeMax: number;
}

export class FPSMonitor {
  private frameTimes: number[] = [];
  private lastTime: number | null = null;
  private readonly windowSize: number;

  constructor(windowSize: number = 60) {
    this.windowSize = windowSize;
  }

  public update(): void {
    const now = performance.now();

    // Skip first frame (no previous time to compare)
    if (this.lastTime === null) {
      this.lastTime = now;
      return;
    }

    const deltaMs = now - this.lastTime;
    this.lastTime = now;

    // Store frame time in milliseconds
    this.frameTimes.push(deltaMs);

    // Keep only the last N frames
    if (this.frameTimes.length > this.windowSize) {
      this.frameTimes.shift();
    }
  }

  public getStats(): PerformanceStats {
    if (this.frameTimes.length === 0) {
      return {
        avgFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        frameTimeAvg: 0,
        frameTimeMin: 0,
        frameTimeMax: 0,
      };
    }

    // Calculate frame time stats
    const frameTimeMin = Math.min(...this.frameTimes);
    const frameTimeMax = Math.max(...this.frameTimes);
    const frameTimeAvg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

    // Convert to FPS (handle division by zero)
    const fps = this.frameTimes.map((t) => (t > 0 ? 1000 / t : 0));
    const avgFPS = fps.reduce((a, b) => a + b, 0) / fps.length;
    const minFPS = Math.min(...fps);
    const maxFPS = Math.max(...fps);

    return {
      avgFPS: Math.round(avgFPS * 10) / 10, // Round to 1 decimal
      minFPS: Math.round(minFPS * 10) / 10,
      maxFPS: Math.round(maxFPS * 10) / 10,
      frameTimeAvg: Math.round(frameTimeAvg * 100) / 100, // Round to 2 decimals
      frameTimeMin: Math.round(frameTimeMin * 100) / 100,
      frameTimeMax: Math.round(frameTimeMax * 100) / 100,
    };
  }

  public getAverageFPS(): number {
    return this.getStats().avgFPS;
  }

  public getMinFPS(): number {
    return this.getStats().minFPS;
  }

  public reset(): void {
    this.frameTimes = [];
    this.lastTime = null;
  }

  public getFrameCount(): number {
    return this.frameTimes.length;
  }
}
