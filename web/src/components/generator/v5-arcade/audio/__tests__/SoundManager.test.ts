import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoundManager } from '../SoundManager';

describe('SoundManager', () => {
  let soundManager: SoundManager;
  let createOscillatorSpy: any;
  let createGainSpy: any;

  beforeEach(() => {
    createOscillatorSpy = vi.fn().mockReturnValue({
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: 'sine',
    });

    createGainSpy = vi.fn().mockReturnValue({
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    });

    class MockAudioContext {
      currentTime = 0;
      destination = {};
      createOscillator = createOscillatorSpy;
      createGain = createGainSpy;
      close = vi.fn();
      state = 'running';
      resume = vi.fn();
    }

    global.AudioContext = MockAudioContext as any;

    soundManager = new SoundManager();
  });

  afterEach(() => {
    if (soundManager) {
      soundManager.cleanup();
    }
    vi.restoreAllMocks();
  });

  it('should play beep sound', () => {
    soundManager.play('beep');
    expect(createOscillatorSpy).toHaveBeenCalled();
  });

  it('should play laser sound', () => {
    soundManager.play('laser');
    expect(createOscillatorSpy).toHaveBeenCalled();
  });

  it('should respect mute setting', () => {
    soundManager.setMuted(true);
    soundManager.play('beep');
    expect(createOscillatorSpy).not.toHaveBeenCalled();
  });
});
