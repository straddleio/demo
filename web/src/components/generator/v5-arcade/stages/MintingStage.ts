// web/src/components/generator/v5-arcade/stages/MintingStage.ts
import { SpriteEngine } from '../core/SpriteEngine';
import { SoundManager } from '../audio/SoundManager';
import { SPRITE_CONFIG } from '../utils/sprites';
import { playPaykeyGeneratorEndSound } from '@/lib/sounds';

interface MintingStageConfig {
  tokenId: string; // e.g., "758c519d.02.c16f91"
  canvas: HTMLCanvasElement;
}

interface TetrisBlock {
  x: number;
  y: number;
  targetY: number;
  color: string;
  speed: number;
}

interface Sparkle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  fadeSpeed: number;
}

export class MintingStage {
  private spriteEngine: SpriteEngine;
  private soundManager: SoundManager;
  private config: MintingStageConfig;
  private stageTime: number = 0;
  private tetrisBlocks: TetrisBlock[] = [];
  private sparkles: Sparkle[] = [];
  private coinY: number = -100; // Start off-screen
  private achievementAlpha: number = 0;
  private scoreAlpha: number = 0;
  private coinMintPlayed: boolean = false;
  private fanfarePlayed: boolean = false;

  // Canvas center coordinates
  private centerX: number;
  private centerY: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    config: MintingStageConfig,
    soundManager?: SoundManager
  ) {
    this.spriteEngine = new SpriteEngine(ctx);
    this.soundManager = soundManager || new SoundManager();
    this.config = config;
    this.centerX = config.canvas.width / 2;
    this.centerY = config.canvas.height / 2;

    this.initializeTetrisBlocks();
  }

  private initializeTetrisBlocks(): void {
    // Create 6 Tetris-style blocks that will fall and assemble
    const blockSize = 40;
    const colors = [
      SPRITE_CONFIG.colors.cyan,
      SPRITE_CONFIG.colors.magenta,
      SPRITE_CONFIG.colors.yellow,
      SPRITE_CONFIG.colors.green,
    ];

    // Blocks start from top, staggered positions
    for (let i = 0; i < 6; i++) {
      this.tetrisBlocks.push({
        x: this.centerX - 60 + (i % 3) * blockSize,
        y: -100 - i * 30, // Staggered start
        targetY: this.centerY - 30 + Math.floor(i / 3) * blockSize,
        color: colors[i % colors.length],
        speed: 200 + i * 20, // Pixels per second, staggered speeds
      });
    }
  }

  public update(deltaTime: number): void {
    this.stageTime += deltaTime;

    // Phase 1: 0.0-1.0s - Tetris blocks falling
    if (this.stageTime < 1.0) {
      this.updateTetrisBlocks(deltaTime);
    }

    // Phase 2: 1.0-2.0s - Coin mints with sparkle effect
    if (this.stageTime >= 1.0 && this.stageTime < 2.0) {
      this.updateCoinMinting(deltaTime);
      this.updateSparkles(deltaTime);

      // Play coin sound once at 1.0s
      if (!this.coinMintPlayed) {
        this.soundManager.play('coin');
        this.coinMintPlayed = true;
        this.createSparkles();
      }
    }

    // Phase 3: 2.0-2.5s - Achievement badge appears
    if (this.stageTime >= 2.0 && this.stageTime < 2.5) {
      this.achievementAlpha = Math.min(1.0, (this.stageTime - 2.0) / 0.5);
    }

    // Phase 4: 2.5-3.0s - Final score tallied with fanfare
    if (this.stageTime >= 2.5) {
      this.scoreAlpha = Math.min(1.0, (this.stageTime - 2.5) / 0.5);

      // Play paykey generator end sound once at 2.5s
      if (!this.fanfarePlayed) {
        void playPaykeyGeneratorEndSound();
        this.fanfarePlayed = true;
      }
    }
  }

  private updateTetrisBlocks(deltaTime: number): void {
    for (const block of this.tetrisBlocks) {
      if (block.y < block.targetY) {
        block.y += block.speed * deltaTime;
        // Clamp to target
        if (block.y > block.targetY) {
          block.y = block.targetY;
        }
      }
    }
  }

  private updateCoinMinting(_deltaTime: number): void {
    // Coin drops from top to center smoothly
    const progress = (this.stageTime - 1.0) / 1.0; // 0 to 1 over 1 second
    const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
    this.coinY = -100 + (this.centerY - 50 - -100) * easeOut;
  }

  private createSparkles(): void {
    // Create 12 sparkles around the coin
    const sparkleCount = 12;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const distance = 60;
      this.sparkles.push({
        x: this.centerX + Math.cos(angle) * distance,
        y: this.centerY - 50 + Math.sin(angle) * distance,
        radius: 3 + Math.random() * 3,
        alpha: 1.0,
        fadeSpeed: 0.5 + Math.random() * 0.5,
      });
    }
  }

  private updateSparkles(deltaTime: number): void {
    for (const sparkle of this.sparkles) {
      sparkle.alpha -= sparkle.fadeSpeed * deltaTime;
      if (sparkle.alpha < 0) {
        sparkle.alpha = 0;
      }
    }
  }

  public render(): void {
    // Phase 1: Render Tetris blocks (0.0-1.0s and beyond)
    if (this.stageTime < 1.0) {
      this.renderTetrisBlocks();
    }

    // Phase 2: Render coin (1.0-3.0s)
    if (this.stageTime >= 1.0) {
      this.renderCoin();
      this.renderSparkles();
    }

    // Phase 3: Render achievement badge (2.0-3.0s)
    if (this.stageTime >= 2.0) {
      this.renderAchievement();
    }

    // Phase 4: Render final score (2.5-3.0s)
    if (this.stageTime >= 2.5) {
      this.renderFinalScore();
    }

    // Flush batched draw calls
    this.spriteEngine.flush();
  }

  private renderTetrisBlocks(): void {
    for (const block of this.tetrisBlocks) {
      this.spriteEngine.drawRect(block.x, block.y, 40, 40, block.color, true);
    }
  }

  private renderCoin(): void {
    const coinX = this.centerX;
    const coinY = this.coinY;
    const coinRadius = 50;

    // Draw gold coin circle
    this.spriteEngine.drawCircle(coinX, coinY, coinRadius, SPRITE_CONFIG.colors.yellow, true);

    // Draw coin border
    this.spriteEngine.drawCircle(coinX, coinY, coinRadius - 5, SPRITE_CONFIG.colors.cyan, false);

    // Draw token ID text on coin (truncated)
    const tokenShort = this.config.tokenId.split('.')[0].substring(0, 6);
    this.spriteEngine.drawText(
      tokenShort,
      coinX - 35,
      coinY - 8,
      SPRITE_CONFIG.colors.black,
      12,
      false
    );
  }

  private renderSparkles(): void {
    for (const sparkle of this.sparkles) {
      if (sparkle.alpha > 0) {
        // Create sparkle with alpha transparency
        const color = `rgba(255, 255, 255, ${sparkle.alpha})`;
        this.spriteEngine.drawCircle(sparkle.x, sparkle.y, sparkle.radius, color, true);
      }
    }
  }

  private renderAchievement(): void {
    const badgeX = this.centerX;
    const badgeY = this.centerY + 80;

    // Draw achievement badge background with fade-in
    const bgColor = `rgba(255, 0, 255, ${this.achievementAlpha})`;
    this.spriteEngine.drawRect(badgeX - 100, badgeY - 20, 200, 40, bgColor, true);

    // Draw achievement text
    const textColor = `rgba(255, 255, 255, ${this.achievementAlpha})`;
    this.spriteEngine.drawText(
      'VERIFIED!',
      badgeX - 70,
      badgeY - 8,
      textColor,
      SPRITE_CONFIG.font.sizes.medium,
      true
    );
  }

  private renderFinalScore(): void {
    const scoreX = this.centerX;
    const scoreY = this.centerY + 140;

    // Calculate final score: 25,000 for successful mint
    const finalScore = 25000;

    // Draw final score with fade-in
    const textColor = `rgba(0, 255, 255, ${this.scoreAlpha})`;
    this.spriteEngine.drawText(
      `+${finalScore.toLocaleString()}`,
      scoreX - 80,
      scoreY,
      textColor,
      SPRITE_CONFIG.font.sizes.large,
      true
    );

    // Draw "MINTING COMPLETE" label
    this.spriteEngine.drawText(
      'MINTING COMPLETE',
      scoreX - 100,
      scoreY - 30,
      textColor,
      SPRITE_CONFIG.font.sizes.small,
      false
    );
  }

  public isComplete(): boolean {
    return this.stageTime >= 3.0;
  }

  public cleanup(): void {
    this.soundManager.cleanup();
  }
}
