import { GameStage, StageContext } from '../core/Stage';
import { SPRITE_CONFIG } from '../utils/sprites';

export class WaldoStage implements GameStage {
  public name: string = 'WALDO';
  public isComplete: boolean = false;

  private context: StageContext | null = null;
  private timeInStage: number = 0;
  private duration: number = 4.0;

  // State
  private customerName: string = '';
  private playedSounds: Set<string> = new Set();

  public start(context: StageContext): void {
    this.context = context;
    this.timeInStage = 0;
    this.isComplete = false;
    const name: string = context.data.customerName || 'UNKNOWN USER';
    this.customerName = name.toUpperCase();
    this.playedSounds.clear();
  }

  public update(deltaTime: number, _totalTime: number): void {
    if (!this.context || this.isComplete) {
      return;
    }

    this.timeInStage += deltaTime;

    // Sound Triggers
    if (this.timeInStage < 0.5 && !this.playedSounds.has('typewriter')) {
      // Play beep periodically for typewriter? Or just once?
      // Just once for start
      this.context.playSound('beep');
      this.playedSounds.add('typewriter');
    }

    if (this.timeInStage > 1.5 && !this.playedSounds.has('targets')) {
      this.context.playSound('laser');
      this.playedSounds.add('targets');
    }

    if (this.timeInStage > 2.5 && !this.playedSounds.has('lock')) {
      this.context.playSound('lock');
      this.playedSounds.add('lock');
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

    // 1. Typewriter Effect (0.0 - 0.5s)
    if (this.timeInStage < 0.5) {
      const progress = this.timeInStage / 0.5;
      const charCount = Math.floor(this.customerName.length * progress);
      const visibleText = this.customerName.substring(0, charCount);

      spriteEngine.drawText(
        visibleText,
        centerX - this.customerName.length * 8, // Rough centering
        centerY,
        SPRITE_CONFIG.colors.cyan,
        SPRITE_CONFIG.font.sizes.medium
      );
    }
    // 2. Pixelate/Normalization (0.5 - 1.5s)
    else if (this.timeInStage < 1.5) {
      // Show full name pulsing
      spriteEngine.drawText(
        this.customerName,
        centerX - this.customerName.length * 8,
        centerY,
        Math.random() > 0.5 ? SPRITE_CONFIG.colors.cyan : SPRITE_CONFIG.colors.white,
        SPRITE_CONFIG.font.sizes.medium
      );
    }
    // 3. Targets (1.5 - 2.5s)
    else if (this.timeInStage < 2.5) {
      // Show variations
      const variations = [
        this.customerName,
        `MR ${this.customerName.split(' ')[0]}`,
        `${this.customerName.split(' ')[1]}, ${this.customerName.split(' ')[0]}`,
      ];

      variations.forEach((text, i) => {
        spriteEngine.drawText(
          `○ ${text}`,
          centerX - 100,
          centerY - 50 + i * 40,
          SPRITE_CONFIG.colors.magenta,
          SPRITE_CONFIG.font.sizes.small
        );
      });
    }
    // 4. Lock (2.5s +)
    else {
      // Final Match
      spriteEngine.drawText(
        `✓ ${this.customerName}`,
        centerX - this.customerName.length * 8,
        centerY,
        SPRITE_CONFIG.colors.green,
        SPRITE_CONFIG.font.sizes.large
      );

      spriteEngine.drawText(
        'MATCH CONFIRMED',
        centerX - 80,
        centerY + 40,
        SPRITE_CONFIG.colors.yellow,
        SPRITE_CONFIG.font.sizes.small
      );
    }
  }
}
