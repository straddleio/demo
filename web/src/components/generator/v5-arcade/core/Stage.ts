import { SpriteEngine } from '../core/SpriteEngine';
import { SOUNDS } from '../audio/sounds';
import type { GeneratorData } from '../../../../lib/state';

export interface StageContext {
  spriteEngine: SpriteEngine;
  width: number;
  height: number;
  data: GeneratorData;
  playSound: (sound: keyof typeof SOUNDS) => void;
}

export interface GameStage {
  name: string;
  isComplete: boolean;
  start(context: StageContext): void;
  update(deltaTime: number, totalTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}
