import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setSoundEnabled,
  isSoundEnabled,
  playApproveSound,
  playRejectSound,
  playReviewAlertSound,
  playEndDemoSound,
  playChargeStatusSound,
  playAutoAttackSound,
  playBridgeOpenedSound,
  playMenuOpenedSound,
  playMenuClosedSound,
} from '../sounds';

describe('Sound System', () => {
  beforeEach(() => {
    // Mock HTMLAudioElement with proper constructor pattern
    const AudioMock = vi.fn().mockImplementation(function (this: any) {
      this.play = vi.fn().mockResolvedValue(undefined);
      this.pause = vi.fn();
      this.load = vi.fn();
      this.volume = 0;
    });
    global.Audio = AudioMock as any;

    // Enable sound for tests
    setSoundEnabled(true);
  });

  describe('sound system state', () => {
    it('should be enabled by default', () => {
      expect(isSoundEnabled()).toBe(true);
    });

    it('should allow enabling/disabling', () => {
      setSoundEnabled(false);
      expect(isSoundEnabled()).toBe(false);

      setSoundEnabled(true);
      expect(isSoundEnabled()).toBe(true);
    });
  });

  describe('playReviewAlertSound', () => {
    it('should create audio element with correct path', async () => {
      await playReviewAlertSound();

      expect(global.Audio).toHaveBeenCalledWith('/sounds/review_alert.mp3');
    });

    it('should play the audio', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined);
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const result = await playReviewAlertSound();

      expect(mockPlay).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should not play when sound is disabled', async () => {
      setSoundEnabled(false);

      const result = await playReviewAlertSound();

      expect(global.Audio).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const mockPlay = vi.fn().mockRejectedValue(new Error('Play failed'));
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await playReviewAlertSound();

      expect(result).toBe(false);
      expect(consoleWarn).toHaveBeenCalledWith(
        'Review alert sound failed to play:',
        expect.any(Error)
      );

      consoleWarn.mockRestore();
    });
  });

  describe('playEndDemoSound', () => {
    it('should create audio element with correct path', async () => {
      // Mock Audio with onended event simulation
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = vi.fn().mockResolvedValue(undefined);
        this.pause = vi.fn();
        // Simulate onended event immediately after play
        this.play = vi.fn().mockImplementation(() => {
          setTimeout(() => {
            if (this.onended) this.onended();
          }, 0);
          return Promise.resolve();
        });
      }) as any;

      await playEndDemoSound();

      expect(global.Audio).toHaveBeenCalledWith('/sounds/end_demo.mp3');
    });

    it('should play the audio', async () => {
      const playCallCount = { count: 0 };
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.pause = vi.fn();
        // Simulate onended event immediately after play
        this.play = vi.fn().mockImplementation(() => {
          playCallCount.count++;
          setTimeout(() => {
            if (this.onended) this.onended();
          }, 0);
          return Promise.resolve();
        });
      }) as any;

      const result = await playEndDemoSound();

      expect(playCallCount.count).toBeGreaterThan(0);
      expect(result).toBe(true);
    });

    it('should not play when sound is disabled', async () => {
      setSoundEnabled(false);

      const result = await playEndDemoSound();

      expect(global.Audio).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('playChargeStatusSound', () => {
    it('should create audio element with correct path', async () => {
      await playChargeStatusSound();

      expect(global.Audio).toHaveBeenCalledWith('/sounds/charge_status_event.mp3');
    });

    it('should play the audio', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined);
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const result = await playChargeStatusSound();

      expect(mockPlay).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should not play when sound is disabled', async () => {
      setSoundEnabled(false);

      const result = await playChargeStatusSound();

      expect(global.Audio).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const mockPlay = vi.fn().mockRejectedValue(new Error('Play failed'));
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await playChargeStatusSound();

      expect(result).toBe(false);
      expect(consoleWarn).toHaveBeenCalledWith(
        'Charge status sound failed to play:',
        expect.any(Error)
      );

      consoleWarn.mockRestore();
    });
  });

  describe('playAutoAttackSound', () => {
    it('should create audio element with correct path', async () => {
      await playAutoAttackSound();

      expect(global.Audio).toHaveBeenCalledWith('/sounds/auto_attack.mp3');
    });

    it('should play the audio', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined);
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const result = await playAutoAttackSound();

      expect(mockPlay).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should not play when sound is disabled', async () => {
      setSoundEnabled(false);

      const result = await playAutoAttackSound();

      expect(global.Audio).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const mockPlay = vi.fn().mockRejectedValue(new Error('Play failed'));
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await playAutoAttackSound();

      expect(result).toBe(false);
      expect(consoleWarn).toHaveBeenCalledWith(
        'Auto attack sound failed to play:',
        expect.any(Error)
      );

      consoleWarn.mockRestore();
    });
  });

  describe('playBridgeOpenedSound', () => {
    it('should create audio element with correct path', async () => {
      await playBridgeOpenedSound();

      expect(global.Audio).toHaveBeenCalledWith('/sounds/bridge_opened.mp3');
    });

    it('should play the audio', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined);
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const result = await playBridgeOpenedSound();

      expect(mockPlay).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should not play when sound is disabled', async () => {
      setSoundEnabled(false);

      const result = await playBridgeOpenedSound();

      expect(global.Audio).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const mockPlay = vi.fn().mockRejectedValue(new Error('Play failed'));
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await playBridgeOpenedSound();

      expect(result).toBe(false);
      expect(consoleWarn).toHaveBeenCalledWith(
        'Bridge opened sound failed to play:',
        expect.any(Error)
      );

      consoleWarn.mockRestore();
    });
  });

  describe('playMenuOpenedSound', () => {
    it('should create audio element with correct path', async () => {
      await playMenuOpenedSound();

      expect(global.Audio).toHaveBeenCalledWith('/sounds/menu_opened.mp3');
    });

    it('should play the audio', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined);
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const result = await playMenuOpenedSound();

      expect(mockPlay).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should not play when sound is disabled', async () => {
      setSoundEnabled(false);

      const result = await playMenuOpenedSound();

      expect(global.Audio).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const mockPlay = vi.fn().mockRejectedValue(new Error('Play failed'));
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await playMenuOpenedSound();

      expect(result).toBe(false);
      expect(consoleWarn).toHaveBeenCalledWith(
        'Menu opened sound failed to play:',
        expect.any(Error)
      );

      consoleWarn.mockRestore();
    });
  });

  describe('playMenuClosedSound', () => {
    it('should create audio element with correct path', async () => {
      await playMenuClosedSound();

      expect(global.Audio).toHaveBeenCalledWith('/sounds/menu_closed.mp3');
    });

    it('should play the audio', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined);
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const result = await playMenuClosedSound();

      expect(mockPlay).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should not play when sound is disabled', async () => {
      setSoundEnabled(false);

      const result = await playMenuClosedSound();

      expect(global.Audio).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const mockPlay = vi.fn().mockRejectedValue(new Error('Play failed'));
      global.Audio = vi.fn().mockImplementation(function (this: any) {
        this.volume = 1;
        this.play = mockPlay;
        this.pause = vi.fn();
      }) as any;

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await playMenuClosedSound();

      expect(result).toBe(false);
      expect(consoleWarn).toHaveBeenCalledWith(
        'Menu closed sound failed to play:',
        expect.any(Error)
      );

      consoleWarn.mockRestore();
    });
  });

  describe('existing sounds still work', () => {
    it('should play approve sound', async () => {
      await playApproveSound();

      expect(global.Audio).toHaveBeenCalledWith('/sounds/approve.mp3');
    });

    it('should play reject sound', async () => {
      await playRejectSound();

      expect(global.Audio).toHaveBeenCalledWith('/sounds/reject.mp3');
    });
  });
});
