// web/src/components/generator/v5-arcade/stages/WaldoStage.ts
import { SpriteEngine } from '../core/SpriteEngine';
import { SoundManager } from '../audio/SoundManager';
import { SPRITE_CONFIG } from '../utils/sprites';

export interface WaldoStageData {
  customerName: string; // e.g., "Alberta Bobbeth Charleson"
  matchedName: string; // e.g., "Alberta B Charleson"
  confidence: number; // 0-100
}

interface NameTarget {
  text: string;
  x: number;
  y: number;
  isMatch: boolean;
  shot: boolean;
  opacity: number;
}

export class WaldoStage {
  private sprite: SpriteEngine;
  private sound: SoundManager;
  private data: WaldoStageData;
  private startTime: number = 0;
  private complete: boolean = false;

  // Animation state
  private typewriterIndex: number = 0;
  private pixelateAmount: number = 0;
  private targets: NameTarget[] = [];
  private currentTargetIndex: number = 0;
  private matchLocked: boolean = false;
  private score: number = 0;

  constructor(sprite: SpriteEngine, sound: SoundManager, data: WaldoStageData) {
    this.sprite = sprite;
    this.sound = sound;
    this.data = data;
  }

  public start(): void {
    this.startTime = performance.now();
    this.complete = false;
    this.typewriterIndex = 0;
    this.pixelateAmount = 0;
    this.targets = [];
    this.currentTargetIndex = 0;
    this.matchLocked = false;
    this.score = 0;

    // Generate name variations as targets
    this.generateTargets();
  }

  public update(_deltaTime: number, _totalTime: number): void {
    const elapsed = (performance.now() - this.startTime) / 1000; // Convert to seconds

    // Phase 1: Typewriter (0.0-0.5s)
    if (elapsed < 0.5) {
      this.updateTypewriter(elapsed);
    }
    // Phase 2: Pixelate/Depixelate (0.5-1.5s)
    else if (elapsed < 1.5) {
      this.updatePixelate(elapsed - 0.5);
    }
    // Phase 3: Target Shooting (1.5-2.5s)
    else if (elapsed < 2.5) {
      this.updateTargetShooting(elapsed - 1.5);
    }
    // Phase 4: Match Lock (2.5-3.5s)
    else if (elapsed < 3.5) {
      this.updateMatchLock(elapsed - 2.5);
    }
    // Phase 5: Score Counter (3.5-4.0s)
    else if (elapsed < 4.0) {
      this.updateScoreCounter(elapsed - 3.5);
    }
    // Complete
    else {
      this.complete = true;
    }
  }

  public render(): void {
    const elapsed = (performance.now() - this.startTime) / 1000;

    // Clear title area
    this.sprite.drawText(
      'STAGE 1: WALDO IDENTITY MATCH',
      50,
      40,
      SPRITE_CONFIG.colors.cyan,
      SPRITE_CONFIG.font.sizes.medium,
      true
    );

    if (elapsed < 0.5) {
      this.renderTypewriter();
    } else if (elapsed < 1.5) {
      this.renderPixelate();
    } else if (elapsed < 2.5) {
      this.renderTargets();
    } else if (elapsed < 3.5) {
      this.renderMatchLock();
    } else if (elapsed < 4.0) {
      this.renderScoreCounter();
    } else {
      this.renderComplete();
    }

    // Flush batched draw calls
    this.sprite.flush();
  }

  public isComplete(): boolean {
    return this.complete;
  }

  public getScore(): number {
    return this.score;
  }

  // PRIVATE METHODS

  private generateTargets(): void {
    const variations = this.generateNameVariations();
    const centerX = 320;
    const startY = 150;
    const spacing = 50;

    this.targets = variations.map((text, index) => ({
      text,
      x: centerX,
      y: startY + index * spacing,
      isMatch: text === this.data.matchedName.toUpperCase(),
      shot: false,
      opacity: 1.0,
    }));
  }

  private generateNameVariations(): string[] {
    const name = this.data.customerName.toUpperCase();
    const matched = this.data.matchedName.toUpperCase();

    // Generate 3-4 plausible variations
    const variations = [matched];

    // Add some variations
    const parts = name.split(' ');
    if (parts.length >= 3) {
      // First + Middle Initial + Last
      variations.push(`${parts[0]} ${parts[1][0]} ${parts[parts.length - 1]}`);
      // Mr/Ms prefix
      variations.push(`MR ${parts[0]} ${parts[parts.length - 1]}`);
      // Last, First format
      variations.push(`${parts[parts.length - 1]}, ${parts[0]} ${parts[1][0]}`);
    }

    // Shuffle to randomize position of correct match
    return this.shuffleArray(variations).slice(0, 4);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // PHASE 1: Typewriter (0.0-0.5s)
  private updateTypewriter(elapsed: number): void {
    const totalChars = this.data.customerName.length;
    const charsPerSecond = totalChars / 0.5;
    const targetIndex = Math.floor(elapsed * charsPerSecond);

    if (targetIndex > this.typewriterIndex && targetIndex <= totalChars) {
      this.typewriterIndex = targetIndex;
      this.sound.play('beep');
    }
  }

  private renderTypewriter(): void {
    const displayText = this.data.customerName.substring(0, this.typewriterIndex).toUpperCase();
    this.sprite.drawText(
      displayText,
      100,
      150,
      SPRITE_CONFIG.colors.yellow,
      SPRITE_CONFIG.font.sizes.medium,
      true
    );

    // Draw cursor
    if (this.typewriterIndex < this.data.customerName.length) {
      const cursorX = 100 + this.typewriterIndex * 10;
      this.sprite.drawRect(cursorX, 150, 8, 16, SPRITE_CONFIG.colors.yellow, true);
    }
  }

  // PHASE 2: Pixelate/Depixelate (0.5-1.5s)
  private updatePixelate(elapsed: number): void {
    // Pixelate from 0 to 1 in first half (0.0-0.5s)
    // Depixelate from 1 to 0 in second half (0.5-1.0s)
    if (elapsed < 0.5) {
      this.pixelateAmount = elapsed / 0.5; // 0 to 1
    } else {
      this.pixelateAmount = 1 - (elapsed - 0.5) / 0.5; // 1 to 0
    }
  }

  private renderPixelate(): void {
    const text = this.data.customerName.toUpperCase();
    const baseX = 100;
    const baseY = 150;

    if (this.pixelateAmount < 0.1) {
      // Fully clear, just render text
      this.sprite.drawText(
        text,
        baseX,
        baseY,
        SPRITE_CONFIG.colors.yellow,
        SPRITE_CONFIG.font.sizes.medium,
        true
      );
    } else {
      // Pixelate effect: offset each character randomly
      const pixelSize = Math.floor(this.pixelateAmount * 10);
      for (let i = 0; i < text.length; i++) {
        const offsetX = (Math.random() - 0.5) * pixelSize;
        const offsetY = (Math.random() - 0.5) * pixelSize;
        this.sprite.drawText(
          text[i],
          baseX + i * 10 + offsetX,
          baseY + offsetY,
          SPRITE_CONFIG.colors.yellow,
          SPRITE_CONFIG.font.sizes.medium,
          true
        );
      }
    }
  }

  // PHASE 3: Target Shooting (1.5-2.5s)
  private updateTargetShooting(elapsed: number): void {
    const shootInterval = 1.0 / this.targets.length;
    const targetIndex = Math.floor(elapsed / shootInterval);

    if (targetIndex > this.currentTargetIndex && targetIndex < this.targets.length) {
      // Shoot the next target
      this.currentTargetIndex = targetIndex;
      const target = this.targets[targetIndex];

      if (!target.isMatch) {
        // Miss - shoot and fade out
        target.shot = true;
        this.sound.play('laser');
      }
    }

    // Fade out shot targets
    this.targets.forEach((target) => {
      if (target.shot && target.opacity > 0) {
        target.opacity -= 0.05;
      }
    });
  }

  private renderTargets(): void {
    this.targets.forEach((target, index) => {
      if (target.shot && target.opacity <= 0) {
        return; // Don't render shot targets
      }

      // Draw target circle
      this.sprite.drawCircle(target.x - 20, target.y + 8, 8, SPRITE_CONFIG.colors.magenta, true);

      // Draw name
      const color = target.isMatch ? SPRITE_CONFIG.colors.green : SPRITE_CONFIG.colors.white;

      this.sprite.drawText(target.text, target.x, target.y, color, 12, true);

      // Draw laser line if currently shooting
      if (index === this.currentTargetIndex && !target.isMatch) {
        this.sprite.drawLine(
          50,
          240,
          target.x - 20,
          target.y + 8,
          SPRITE_CONFIG.colors.cyan,
          2,
          true
        );
      }
    });
  }

  // PHASE 4: Match Lock (2.5-3.5s)
  private updateMatchLock(elapsed: number): void {
    if (!this.matchLocked && elapsed > 0.1) {
      this.matchLocked = true;
      this.sound.play('lock');
    }
  }

  private renderMatchLock(): void {
    // Find matched target
    const matchedTarget = this.targets.find((t) => t.isMatch);
    if (!matchedTarget) {
      return;
    }

    // Draw checkmark
    this.sprite.drawText(
      '✓',
      matchedTarget.x - 40,
      matchedTarget.y,
      SPRITE_CONFIG.colors.green,
      SPRITE_CONFIG.font.sizes.large,
      true
    );

    // Draw matched name
    this.sprite.drawText(
      matchedTarget.text,
      matchedTarget.x,
      matchedTarget.y,
      SPRITE_CONFIG.colors.green,
      SPRITE_CONFIG.font.sizes.medium,
      true
    );

    // Draw confidence bar
    const barX = 100;
    const barY = matchedTarget.y + 40;
    const barWidth = 200;
    const barHeight = 20;
    const fillWidth = (barWidth * this.data.confidence) / 100;

    // Border
    this.sprite.drawRect(barX, barY, barWidth, barHeight, SPRITE_CONFIG.colors.white, false);

    // Fill
    this.sprite.drawRect(
      barX + 2,
      barY + 2,
      fillWidth - 4,
      barHeight - 4,
      SPRITE_CONFIG.colors.green,
      true
    );

    // Confidence text
    this.sprite.drawText(
      `MATCH: ${this.data.confidence}%`,
      barX + barWidth + 20,
      barY,
      SPRITE_CONFIG.colors.green,
      12,
      true
    );
  }

  // PHASE 5: Score Counter (3.5-4.0s)
  private updateScoreCounter(elapsed: number): void {
    const targetScore = this.data.confidence * 100;
    const progress = Math.min(elapsed / 0.5, 1.0); // Animate over 0.5s
    this.score = Math.floor(targetScore * progress);
  }

  private renderScoreCounter(): void {
    // Render match lock state first
    this.renderMatchLock();

    // Render incrementing score
    const scoreY = 350;
    this.sprite.drawText(
      `+${this.score.toString().padStart(5, '0')}`,
      200,
      scoreY,
      SPRITE_CONFIG.colors.yellow,
      SPRITE_CONFIG.font.sizes.large,
      true
    );
  }

  private renderComplete(): void {
    // Final state - show completed match lock and score
    this.renderMatchLock();

    const finalScore = this.data.confidence * 100;
    this.sprite.drawText(
      `+${finalScore.toString().padStart(5, '0')}`,
      200,
      350,
      SPRITE_CONFIG.colors.yellow,
      SPRITE_CONFIG.font.sizes.large,
      true
    );
  }
}
