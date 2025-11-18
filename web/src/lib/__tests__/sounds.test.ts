import { describe, it, expect, vi, afterEach } from 'vitest';
import { playRejectSound, playApproveSound, setSoundEnabled } from '../sounds';

describe('Sound System', () => {
  afterEach(() => {
    // Reset sound state after each test
    setSoundEnabled(false);
  });

  describe('sound disabled by default', () => {
    it('should have sound disabled by default', async () => {
      const result = await playRejectSound();
      expect(result).toBe(false);
    });
  });

  describe('sound enabled/disabled control', () => {
    it('should play reject sound when enabled', async () => {
      const mockPlayFn = vi.fn().mockResolvedValue(undefined);
      global.Audio = class {
        volume = 1;
        play = mockPlayFn;
        pause(): void {}
      } as unknown as typeof Audio;

      setSoundEnabled(true);
      const result = await playRejectSound();

      expect(result).toBe(true);
      expect(mockPlayFn).toHaveBeenCalled();
    });

    it('should not play reject sound when disabled', async () => {
      setSoundEnabled(false);
      const result = await playRejectSound();

      expect(result).toBe(false);
    });

    it('should play approve sound when enabled', async () => {
      const mockPlayFn = vi.fn().mockResolvedValue(undefined);
      global.Audio = class {
        volume = 1;
        play = mockPlayFn;
        pause(): void {}
      } as unknown as typeof Audio;

      setSoundEnabled(true);
      const result = await playApproveSound();

      expect(result).toBe(true);
      expect(mockPlayFn).toHaveBeenCalled();
    });

    it('should not play approve sound when disabled', async () => {
      setSoundEnabled(false);
      const result = await playApproveSound();

      expect(result).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle missing sound files gracefully', async () => {
      global.Audio = class {
        volume = 1;
        play(): void {
          throw new Error('Sound file not found');
        }
        pause(): void {}
      } as unknown as typeof Audio;

      setSoundEnabled(true);
      const result = await playRejectSound();

      // Should not throw, returns false
      expect(result).toBe(false);
    });

    it('should handle rejected audio play promise', async () => {
      const mockPlayFn = vi.fn().mockRejectedValue(new Error('Network error'));
      global.Audio = class {
        volume = 1;
        play = mockPlayFn;
        pause(): void {}
      } as unknown as typeof Audio;

      setSoundEnabled(true);
      const result = await playApproveSound();

      expect(result).toBe(false);
    });
  });
});
