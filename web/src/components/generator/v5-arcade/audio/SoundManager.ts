import { SOUNDS } from './sounds';

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Lazy init AudioContext (requires user interaction usually, but we init here)
    if (typeof window !== 'undefined' && typeof window.AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
    }
  }

  public play(soundName: keyof typeof SOUNDS): void {
    if (this.muted || !this.audioContext) {
      return;
    }

    const sound = SOUNDS[soundName];
    if (!sound) {
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = sound.waveform;
    oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(sound.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + sound.duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + sound.duration);
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.audioContext && this.audioContext.state === 'suspended' && !muted) {
      void this.audioContext.resume();
    }
  }

  public cleanup(): void {
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }
}
