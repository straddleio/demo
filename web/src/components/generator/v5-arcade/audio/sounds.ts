// web/src/components/generator/v5-arcade/audio/sounds.ts
export interface Sound {
  type: 'beep' | 'laser' | 'lock' | 'chomp' | 'coin' | 'fanfare';
  frequency: number;
  duration: number;
  volume: number;
  waveform: OscillatorType;
}

export const SOUNDS: Record<string, Sound> = {
  beep: {
    type: 'beep',
    frequency: 800,
    duration: 0.05,
    volume: 0.3,
    waveform: 'square',
  },
  laser: {
    type: 'laser',
    frequency: 1200,
    duration: 0.15,
    volume: 0.4,
    waveform: 'sawtooth',
  },
  lock: {
    type: 'lock',
    frequency: 600,
    duration: 0.2,
    volume: 0.5,
    waveform: 'triangle',
  },
  chomp: {
    type: 'chomp',
    frequency: 400,
    duration: 0.1,
    volume: 0.4,
    waveform: 'square',
  },
  coin: {
    type: 'coin',
    frequency: 1000,
    duration: 0.3,
    volume: 0.5,
    waveform: 'sine',
  },
  fanfare: {
    type: 'fanfare',
    frequency: 1500,
    duration: 0.5,
    volume: 0.6,
    waveform: 'triangle',
  },
};
