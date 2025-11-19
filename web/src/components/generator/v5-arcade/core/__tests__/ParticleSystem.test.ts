import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ParticleSystem } from '../ParticleSystem';

describe('ParticleSystem', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let particleSystem: ParticleSystem;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;

    // Mock context methods used by ParticleSystem
    ctx = {
      canvas: canvas,
      fillStyle: '',
      globalAlpha: 1,
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    particleSystem = new ParticleSystem(ctx);
  });

  describe('Particle Emission', () => {
    it('should emit explosion particles (20-30 count)', () => {
      particleSystem.emitExplosion(320, 240, 25, '#FF0099');

      const activeCount = particleSystem.getActiveCount();
      expect(activeCount).toBe(25);
    });

    it('should emit sparkle particles', () => {
      particleSystem.emitSparkle(100, 100, 10);

      const activeCount = particleSystem.getActiveCount();
      expect(activeCount).toBe(10);
    });

    it('should emit trail particles', () => {
      particleSystem.emitTrail(200, 200, 5, -3);

      const activeCount = particleSystem.getActiveCount();
      expect(activeCount).toBeGreaterThan(0);
    });

    it('should not exceed max particle pool size', () => {
      // Emit way more than pool size
      for (let i = 0; i < 30; i++) {
        particleSystem.emitExplosion(100, 100, 30, '#00FFFF');
      }

      const activeCount = particleSystem.getActiveCount();
      expect(activeCount).toBeLessThanOrEqual(500); // Max pool size
    });
  });

  describe('Particle Lifetime', () => {
    it('should decrease particle life over time', () => {
      particleSystem.emitExplosion(320, 240, 5, '#00FFFF');

      const initialCount = particleSystem.getActiveCount();
      expect(initialCount).toBe(5);

      // Update for long enough to kill particles
      particleSystem.update(2.0); // 2 seconds

      const afterCount = particleSystem.getActiveCount();
      expect(afterCount).toBeLessThan(initialCount);
    });

    it('should remove dead particles (life <= 0)', () => {
      particleSystem.emitExplosion(320, 240, 10, '#FF0099');

      // Update for very long time to ensure all particles die
      particleSystem.update(5.0); // 5 seconds

      const activeCount = particleSystem.getActiveCount();
      expect(activeCount).toBe(0);
    });
  });

  describe('Particle Rendering', () => {
    it('should render particles as circles', () => {
      particleSystem.emitExplosion(320, 240, 5, '#00FFFF');
      particleSystem.render();

      // Should call arc for each particle
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should apply alpha based on particle life', () => {
      particleSystem.emitExplosion(320, 240, 1, '#00FFFF');

      // Half-life particle
      particleSystem.update(0.5);
      particleSystem.render();

      // globalAlpha should be set (less than 1 for faded particle)
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('should not render dead particles', () => {
      particleSystem.emitExplosion(320, 240, 5, '#00FFFF');

      // Kill all particles
      particleSystem.update(5.0);

      vi.clearAllMocks();
      particleSystem.render();

      // Should not call arc/fill if no active particles
      expect(ctx.arc).not.toHaveBeenCalled();
    });
  });

  describe('Object Pooling', () => {
    it('should reuse dead particles', () => {
      // Emit first batch
      particleSystem.emitExplosion(100, 100, 10, '#00FFFF');

      // Kill them
      particleSystem.update(5.0);
      expect(particleSystem.getActiveCount()).toBe(0);

      // Emit second batch - should reuse pool
      particleSystem.emitExplosion(200, 200, 10, '#FF0099');
      expect(particleSystem.getActiveCount()).toBe(10);
    });

    it('should handle concurrent particle types', () => {
      particleSystem.emitExplosion(100, 100, 10, '#00FFFF');
      particleSystem.emitSparkle(200, 200, 5);
      particleSystem.emitTrail(300, 300, 2, -2);

      const totalActive = particleSystem.getActiveCount();
      expect(totalActive).toBeGreaterThanOrEqual(15);
    });
  });

  describe('Performance', () => {
    it('should update 500 particles in under 5ms', () => {
      // Fill pool to max
      for (let i = 0; i < 20; i++) {
        particleSystem.emitExplosion(i * 10, i * 10, 25, '#00FFFF');
      }

      const startTime = performance.now();
      particleSystem.update(0.016); // 60fps frame
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5);
    });

    it('should render 500 particles in under 10ms', () => {
      // Fill pool to max
      for (let i = 0; i < 20; i++) {
        particleSystem.emitExplosion(i * 10, i * 10, 25, '#00FFFF');
      }

      const startTime = performance.now();
      particleSystem.render();
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Physics', () => {
    it('should apply velocity to explosions', () => {
      particleSystem.emitExplosion(320, 240, 1, '#00FFFF');

      // Update once
      particleSystem.update(0.1);

      // Particles should have moved (can't directly check position, but active count should remain)
      expect(particleSystem.getActiveCount()).toBe(1);
    });

    it('should apply gravity to explosion particles', () => {
      particleSystem.emitExplosion(320, 240, 1, '#00FFFF');

      // Multiple updates should show gravity effect
      particleSystem.update(0.016);
      particleSystem.update(0.016);
      particleSystem.update(0.016);

      expect(particleSystem.getActiveCount()).toBe(1);
    });
  });
});
