import { GameStage, StageContext } from '../core/Stage';
import { SPRITE_CONFIG } from '../utils/sprites';

export class MintingStage implements GameStage {
  public name: string = 'MINTING';
  public isComplete: boolean = false;

  private context: StageContext | null = null;
  private timeInStage: number = 0;
  private duration: number = 3.0;
  private playedSounds: Set<string> = new Set();

  public start(context: StageContext): void {
    this.context = context;
    this.timeInStage = 0;
    this.isComplete = false;
    this.playedSounds.clear();
  }

  public update(deltaTime: number, _totalTime: number): void {
    if (!this.context || this.isComplete) {
      return;
    }

    this.timeInStage += deltaTime;

    // Sound Triggers
    if (this.timeInStage > 1.0 && !this.playedSounds.has('coin')) {
      this.context.playSound('coin');
      this.playedSounds.add('coin');
    }

    if (this.timeInStage > 2.0 && !this.playedSounds.has('fanfare')) {
      this.context.playSound('fanfare');
      this.playedSounds.add('fanfare');
    }

    if (this.timeInStage >= this.duration) {
      this.isComplete = true;
    }
  }

  public render(_ctx: CanvasRenderingContext2D): void {
    if (!this.context) {
      return;
    }

    const { spriteEngine, width, height } = this.context;
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Tetris Blocks (0-1.0s)
    if (this.timeInStage < 1.0) {
      const progress = this.timeInStage / 1.0;
      const yOffset = centerY * progress;

      // Falling blocks
      spriteEngine.drawRect(centerX - 20, yOffset - 100, 40, 40, SPRITE_CONFIG.colors.cyan, true);

      spriteEngine.drawRect(centerX - 60, yOffset - 60, 40, 40, SPRITE_CONFIG.colors.magenta, true);
    }
    // 2. Coin Mint (1.0-2.0s)
    else if (this.timeInStage < 2.0) {
      const scale = Math.min(1.5, 1.0 + (this.timeInStage - 1.0));

      // Gold Coin
      spriteEngine.drawCircle(centerX, centerY, 60 * scale, SPRITE_CONFIG.colors.yellow, true);

      spriteEngine.drawText(
        '$',
        centerX - 20,
        centerY - 25,
        SPRITE_CONFIG.colors.black,
        48 * scale
      );
    }
    // 3. Achievement (2.0-3.0s)
    else {
      // Coin still visible
      spriteEngine.drawCircle(
        centerX,
        centerY,
        90, // Pulse up
        SPRITE_CONFIG.colors.yellow,
        true
      );

      // Achievement text
      spriteEngine.drawText(
        'VERIFIED!',
        centerX - 100,
        centerY + 120,
        SPRITE_CONFIG.colors.green,
        SPRITE_CONFIG.font.sizes.large
      );

      spriteEngine.drawText(
        'PAYKEY GENERATED',
        centerX - 120,
        centerY + 160,
        SPRITE_CONFIG.colors.white,
        SPRITE_CONFIG.font.sizes.medium
      );
    }
  }
}
