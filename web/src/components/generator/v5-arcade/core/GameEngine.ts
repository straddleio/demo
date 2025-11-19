import { CRTEffect } from '../effects/CRTEffect';
import { SpriteEngine } from './SpriteEngine';
import { GameStage, StageContext } from './Stage';
import { WaldoStage } from '../stages/WaldoStage';
import { Blake3Stage } from '../stages/Blake3Stage';
import { MintingStage } from '../stages/MintingStage';
import { SoundManager } from '../audio/SoundManager';
import type { GeneratorData } from '../../../../lib/state';

type UpdateCallback = (deltaTime: number, totalTime: number) => void;

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private running: boolean = false;
  private lastFrameTime: number = 0;
  private totalTime: number = 0;
  private animationFrameId: number | null = null;
  private listeners: Map<string, UpdateCallback[]> = new Map();

  // Systems
  private crtEffect: CRTEffect;
  private spriteEngine: SpriteEngine;
  private soundManager: SoundManager;

  // Game State
  private stages: GameStage[] = [];
  private currentStageIndex: number = 0;
  private data: GeneratorData | null = null;
  private onComplete: (() => void) | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.crtEffect = new CRTEffect();
    this.spriteEngine = new SpriteEngine(ctx);
    this.soundManager = new SoundManager();

    // Initialize Stages
    this.stages = [new WaldoStage(), new Blake3Stage(), new MintingStage()];
  }

  public setData(data: GeneratorData): void {
    this.data = data;
  }

  public setOnComplete(callback: () => void): void {
    this.onComplete = callback;
  }

  public start(): void {
    if (this.running) {
      return;
    }

    // Resume audio context on interaction/start
    this.soundManager.setMuted(false);

    this.running = true;
    this.lastFrameTime = performance.now();
    this.totalTime = 0;
    this.currentStageIndex = 0;

    // Start first stage
    this.startStage(0);

    this.gameLoop();
  }

  private startStage(index: number): void {
    if (index >= this.stages.length || !this.data) {
      return;
    }

    const stage = this.stages[index];
    const context: StageContext = {
      spriteEngine: this.spriteEngine,
      width: this.ctx.canvas.width,
      height: this.ctx.canvas.height,
      data: this.data,
      playSound: (sound) => this.soundManager.play(sound),
    };

    stage.start(context);
  }

  public stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.soundManager.cleanup();
  }

  public on(event: string, callback: UpdateCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: UpdateCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, deltaTime: number, totalTime: number): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(deltaTime, totalTime));
    }
  }

  private gameLoop = (): void => {
    if (!this.running) {
      return;
    }

    const currentTime = performance.now();
    const deltaTimeMs = currentTime - this.lastFrameTime;
    const safeDeltaTimeMs = Math.min(deltaTimeMs, 100);
    const deltaTime = safeDeltaTimeMs / 1000;

    this.lastFrameTime = currentTime;
    this.totalTime += deltaTime;

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Update Stage
    if (this.currentStageIndex < this.stages.length) {
      const currentStage = this.stages[this.currentStageIndex];
      currentStage.update(deltaTime, this.totalTime);
      currentStage.render(this.ctx);

      // Check for completion
      if (currentStage.isComplete) {
        this.currentStageIndex++;
        if (this.currentStageIndex < this.stages.length) {
          this.startStage(this.currentStageIndex);
        } else {
          // All stages complete
          if (this.onComplete) {
            // Add small delay before closing
            setTimeout(() => this.onComplete?.(), 1000);
          }
        }
      }
    }

    // Emit update event
    this.emit('update', deltaTime, this.totalTime);

    // Apply CRT effects
    this.crtEffect.render(this.ctx);

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
}
