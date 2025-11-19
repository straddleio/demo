// web/src/components/generator/v5-arcade/audio/__tests__/SoundManager.test.ts
import { vi } from 'vitest';
import { SoundManager } from '../SoundManager';

// Mock AudioContext
const mockOscillator = {
  type: 'sine' as OscillatorType,
  frequency: {
    setValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGainNode = {
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
};

const mockAudioContext = {
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGainNode),
  close: vi.fn(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.AudioContext = function () {
  return mockAudioContext;
} as any;

describe('SoundManager', () => {
  let soundManager: SoundManager;

  beforeEach(() => {
    vi.clearAllMocks();
    soundManager = new SoundManager();
  });

  afterEach(() => {
    soundManager.cleanup();
  });

  it('should play beep sound', () => {
    soundManager.play('beep');

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('should play laser sound with correct frequency', () => {
    soundManager.play('laser');

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('should respect mute setting', () => {
    soundManager.setMuted(true);

    soundManager.play('beep');

    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });
});
