// web/src/components/generator/v5-arcade/utils/__tests__/performance.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FPSMonitor } from '../performance';

describe('FPSMonitor', () => {
  let monitor: FPSMonitor;

  beforeEach(() => {
    // Reset performance.now() mock
    vi.spyOn(performance, 'now').mockReturnValue(0);
    monitor = new FPSMonitor(60);
  });

  describe('update', () => {
    it('should track frame times', () => {
      vi.spyOn(performance, 'now').mockReturnValue(0);
      monitor.update();

      vi.spyOn(performance, 'now').mockReturnValue(16.67); // ~60 FPS
      monitor.update();

      expect(monitor.getFrameCount()).toBe(1);
    });

    it('should maintain a rolling window of frame times', () => {
      const windowSize = 5;
      monitor = new FPSMonitor(windowSize);

      // Add 10 frames
      for (let i = 0; i < 10; i++) {
        vi.spyOn(performance, 'now').mockReturnValue(i * 16.67);
        monitor.update();
      }

      // Should only keep the last 5 frames
      expect(monitor.getFrameCount()).toBe(windowSize);
    });
  });

  describe('getStats', () => {
    it('should return zero stats when no frames recorded', () => {
      const stats = monitor.getStats();

      expect(stats.avgFPS).toBe(0);
      expect(stats.minFPS).toBe(0);
      expect(stats.maxFPS).toBe(0);
      expect(stats.frameTimeAvg).toBe(0);
    });

    it('should calculate correct FPS for 60 FPS target', () => {
      // Simulate 60 FPS (16.67ms per frame)
      for (let i = 0; i < 10; i++) {
        vi.spyOn(performance, 'now').mockReturnValue(i * 16.67);
        monitor.update();
      }

      const stats = monitor.getStats();

      // Should be approximately 60 FPS
      expect(stats.avgFPS).toBeGreaterThan(59);
      expect(stats.avgFPS).toBeLessThan(61);
      expect(stats.frameTimeAvg).toBeGreaterThan(16);
      expect(stats.frameTimeAvg).toBeLessThan(17);
    });

    it('should calculate correct FPS for 30 FPS target', () => {
      // Simulate 30 FPS (33.33ms per frame)
      for (let i = 0; i < 10; i++) {
        vi.spyOn(performance, 'now').mockReturnValue(i * 33.33);
        monitor.update();
      }

      const stats = monitor.getStats();

      // Should be approximately 30 FPS
      expect(stats.avgFPS).toBeGreaterThan(29);
      expect(stats.avgFPS).toBeLessThan(31);
      expect(stats.frameTimeAvg).toBeGreaterThan(33);
      expect(stats.frameTimeAvg).toBeLessThan(34);
    });

    it('should track min/max FPS correctly', () => {
      const frameTimes = [16.67, 33.33, 16.67, 50, 16.67]; // Mix of frame times

      let time = 0;
      for (const frameTime of frameTimes) {
        vi.spyOn(performance, 'now').mockReturnValue(time);
        monitor.update();
        time += frameTime;
      }

      const stats = monitor.getStats();

      // Min FPS should be from the 50ms frame (~20 FPS)
      expect(stats.minFPS).toBeGreaterThan(19);
      expect(stats.minFPS).toBeLessThan(21);

      // Max FPS should be from the 16.67ms frames (~60 FPS)
      expect(stats.maxFPS).toBeGreaterThan(59);
      expect(stats.maxFPS).toBeLessThan(61);
    });
  });

  describe('getAverageFPS', () => {
    it('should return average FPS', () => {
      // Simulate consistent 60 FPS
      for (let i = 0; i < 10; i++) {
        vi.spyOn(performance, 'now').mockReturnValue(i * 16.67);
        monitor.update();
      }

      const avgFPS = monitor.getAverageFPS();
      expect(avgFPS).toBeGreaterThan(59);
      expect(avgFPS).toBeLessThan(61);
    });
  });

  describe('getMinFPS', () => {
    it('should return minimum FPS', () => {
      const frameTimes = [16.67, 50, 16.67]; // One slow frame

      let time = 0;
      for (const frameTime of frameTimes) {
        vi.spyOn(performance, 'now').mockReturnValue(time);
        monitor.update();
        time += frameTime;
      }

      const minFPS = monitor.getMinFPS();
      expect(minFPS).toBeGreaterThan(19);
      expect(minFPS).toBeLessThan(21);
    });
  });

  describe('reset', () => {
    it('should clear all frame times', () => {
      // Add some frames
      for (let i = 0; i < 5; i++) {
        vi.spyOn(performance, 'now').mockReturnValue(i * 16.67);
        monitor.update();
      }

      expect(monitor.getFrameCount()).toBe(4);

      monitor.reset();

      expect(monitor.getFrameCount()).toBe(0);
      expect(monitor.getAverageFPS()).toBe(0);
    });

    it('should reset the start time', () => {
      vi.spyOn(performance, 'now').mockReturnValue(100);
      monitor.reset();

      // First update sets the lastTime
      vi.spyOn(performance, 'now').mockReturnValue(100);
      monitor.update();

      // Second update records the frame time
      vi.spyOn(performance, 'now').mockReturnValue(116.67);
      monitor.update();

      const stats = monitor.getStats();
      expect(stats.avgFPS).toBeGreaterThan(59);
      expect(stats.avgFPS).toBeLessThan(61);
    });
  });

  describe('custom window size', () => {
    it('should respect custom window size', () => {
      monitor = new FPSMonitor(3);

      for (let i = 0; i < 10; i++) {
        vi.spyOn(performance, 'now').mockReturnValue(i * 16.67);
        monitor.update();
      }

      expect(monitor.getFrameCount()).toBe(3);
    });
  });
});
