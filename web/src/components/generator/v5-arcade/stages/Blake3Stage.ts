import { GameStage, StageContext } from '../core/Stage';
import { SPRITE_CONFIG } from '../utils/sprites';

export class Blake3Stage implements GameStage {
  public name: string = 'BLAKE3';
  public isComplete: boolean = false;

  private context: StageContext | null = null;
  private timeInStage: number = 0;
  private duration: number = 4.0;
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
    if (this.timeInStage > 1.0 && !this.playedSounds.has('chomp')) {
      this.context.playSound('chomp');
      this.playedSounds.add('chomp');
    }

    if (this.timeInStage > 3.0 && !this.playedSounds.has('compress')) {
      this.context.playSound('beep'); // Re-use beep for compress
      this.playedSounds.add('compress');
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

    // 1. Data Fly-in (0-1s)
    if (this.timeInStage < 1.0) {
      const progress = this.timeInStage / 1.0;

      // Customer Name from left
      spriteEngine.drawText(
        '👤 IDENTITY',
        centerX * progress - 100,
        centerY - 50,
        SPRITE_CONFIG.colors.cyan,
        SPRITE_CONFIG.font.sizes.small
      );

      // Account from right
      spriteEngine.drawText(
        '🏦 BANK',
        width - centerX * progress + 50,
        centerY + 50,
        SPRITE_CONFIG.colors.magenta,
        SPRITE_CONFIG.font.sizes.small
      );
    }
    // 2. Combine/Chomp (1.0-2.0s)
    else if (this.timeInStage < 2.0) {
      // Pacman style animation (simplified for now)
      spriteEngine.drawCircle(centerX, centerY, 30, SPRITE_CONFIG.colors.yellow);

      spriteEngine.drawText(
        'HASHING...',
        centerX - 60,
        centerY + 50,
        SPRITE_CONFIG.colors.yellow,
        SPRITE_CONFIG.font.sizes.small
      );
    }
    // 3. Hex Scroll (2.0-3.0s)
    else if (this.timeInStage < 3.0) {
      // Matrix style random hex
      for (let i = 0; i < 5; i++) {
        spriteEngine.drawText(
          Math.random().toString(16).substr(2, 16).toUpperCase(),
          centerX - 100,
          centerY - 60 + i * 30,
          SPRITE_CONFIG.colors.green,
          SPRITE_CONFIG.font.sizes.small
        );
      }
    }
    // 4. Compression (3.0-4.0s)
    else {
      const paykeyToken: string = this.context.data.paykeyToken;
      const token: string = paykeyToken || '758c519d.02.c16f91';
      const truncated: string = token.substring(0, 18);
      spriteEngine.drawText(
        truncated + '...',
        centerX - 120,
        centerY,
        SPRITE_CONFIG.colors.white,
        SPRITE_CONFIG.font.sizes.medium
      );

      spriteEngine.drawText(
        '+5000',
        centerX,
        centerY - 40,
        SPRITE_CONFIG.colors.yellow,
        SPRITE_CONFIG.font.sizes.small
      );
    }
  }
}
