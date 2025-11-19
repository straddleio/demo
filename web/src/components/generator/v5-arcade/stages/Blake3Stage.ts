// web/src/components/generator/v5-arcade/stages/Blake3Stage.ts
import { SpriteEngine } from '../core/SpriteEngine';
import { SoundManager } from '../audio/SoundManager';

interface DataNode {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  text: string;
  color: string;
  shape: 'circle' | 'rect';
  size: number;
}

export class Blake3Stage {
  private spriteEngine: SpriteEngine;
  private soundManager: SoundManager;
  private stageTime: number = 0;
  private readonly STAGE_DURATION = 4.0; // 4 seconds total
  private dataNodes: DataNode[] = [];
  private hexBytes: Array<{ x: number; y: number; text: string; alpha: number }> = [];
  private chompPlayed: boolean = false;

  constructor(ctx: CanvasRenderingContext2D, soundManager: SoundManager) {
    this.spriteEngine = new SpriteEngine(ctx);
    this.soundManager = soundManager;
    if (ctx.canvas) {
      this.initializeDataNodes(ctx);
    }
  }

  private initializeDataNodes(ctx: CanvasRenderingContext2D): void {
    const canvasWidth = ctx.canvas?.width ?? 640;
    const canvasHeight = ctx.canvas?.height ?? 480;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Create 4 data nodes that fly in from edges
    this.dataNodes = [
      {
        x: -100,
        y: centerY - 50,
        targetX: centerX - 80,
        targetY: centerY - 80,
        text: 'NAME',
        color: '#00FFFF', // Cyan
        shape: 'circle',
        size: 30,
      },
      {
        x: canvasWidth + 100,
        y: centerY + 50,
        targetX: centerX + 80,
        targetY: centerY - 80,
        text: 'ACCT',
        color: '#FF00FF', // Magenta
        shape: 'rect',
        size: 35,
      },
      {
        x: centerX - 50,
        y: -100,
        targetX: centerX - 80,
        targetY: centerY + 80,
        text: 'WALDO',
        color: '#FFFF00', // Yellow
        shape: 'circle',
        size: 32,
      },
      {
        x: centerX + 50,
        y: canvasHeight + 100,
        targetX: centerX + 80,
        targetY: centerY + 80,
        text: 'ROUTE',
        color: '#00FF00', // Green
        shape: 'rect',
        size: 33,
      },
    ];
  }

  public update(deltaTime: number): boolean {
    this.stageTime += deltaTime;

    // Stage complete after 4 seconds
    if (this.stageTime >= this.STAGE_DURATION) {
      return true;
    }

    return false;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const centerX = (ctx.canvas?.width ?? 640) / 2;
    const centerY = (ctx.canvas?.height ?? 480) / 2;

    // Phase 1: Data nodes fly in (0.0-1.0s)
    if (this.stageTime < 1.0) {
      this.renderFlyIn(ctx, centerX, centerY);
    }
    // Phase 2: Pac-Man chomping animation (1.0-2.0s)
    else if (this.stageTime < 2.0) {
      this.renderChomping(ctx, centerX, centerY);
    }
    // Phase 3: Scrolling hex bytes (2.0-3.0s)
    else if (this.stageTime < 3.0) {
      this.renderHexScroll(ctx, centerX, centerY);
    }
    // Phase 4: Hash compression into token (3.0-4.0s)
    else {
      this.renderTokenCompression(ctx, centerX, centerY);
    }

    // Flush batched draw calls
    this.spriteEngine.flush();
  }

  private renderFlyIn(_ctx: CanvasRenderingContext2D, centerX: number, _centerY: number): void {
    const progress = this.stageTime / 1.0; // 0 to 1
    const easeProgress = this.easeOutCubic(progress);

    // Draw title
    this.spriteEngine.drawText('BLAKE3 HASH GENERATION', centerX - 200, 50, '#00FF00', 16);

    // Animate each node flying in
    this.dataNodes.forEach((node) => {
      const currentX = node.x + (node.targetX - node.x) * easeProgress;
      const currentY = node.y + (node.targetY - node.y) * easeProgress;

      if (node.shape === 'circle') {
        this.spriteEngine.drawCircle(currentX, currentY, node.size, node.color, true);
      } else {
        this.spriteEngine.drawRect(
          currentX - node.size / 2,
          currentY - node.size / 2,
          node.size,
          node.size,
          node.color,
          true
        );
      }

      // Draw label
      this.spriteEngine.drawText(node.text, currentX - 20, currentY - 8, '#FFFFFF', 12);
    });
  }

  private renderChomping(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    const phaseProgress = (this.stageTime - 1.0) / 1.0; // 0 to 1 within this phase

    // Play chomp sound once at start of phase
    if (!this.chompPlayed) {
      this.soundManager.play('chomp');
      this.chompPlayed = true;
    }

    // Draw title
    this.spriteEngine.drawText('COMBINING DATA...', centerX - 150, 50, '#00FF00', 16);

    // Draw Pac-Man in center
    const mouthAngle = Math.abs(Math.sin(this.stageTime * 10)) * 0.3; // Chomping motion
    this.drawPacMan(ctx, centerX, centerY, 50, '#FFFF00', mouthAngle);

    // Draw nodes getting closer to center and shrinking
    this.dataNodes.forEach((node) => {
      const shrinkProgress = phaseProgress;
      const currentSize = node.size * (1 - shrinkProgress * 0.8);
      const currentX = node.targetX + (centerX - node.targetX) * shrinkProgress;
      const currentY = node.targetY + (centerY - node.targetY) * shrinkProgress;

      if (node.shape === 'circle') {
        this.spriteEngine.drawCircle(currentX, currentY, currentSize, node.color, true);
      } else {
        this.spriteEngine.drawRect(
          currentX - currentSize / 2,
          currentY - currentSize / 2,
          currentSize,
          currentSize,
          node.color,
          true
        );
      }
    });
  }

  private renderHexScroll(ctx: CanvasRenderingContext2D, centerX: number, _centerY: number): void {
    // Draw title
    this.spriteEngine.drawText('GENERATING HASH...', centerX - 150, 50, '#00FF00', 16);

    // Generate scrolling hex bytes (Matrix green rain style)
    if (this.hexBytes.length === 0 || Math.random() > 0.7) {
      const numColumns = 8;
      const columnWidth = 60;
      const startX = centerX - (numColumns * columnWidth) / 2;

      for (let i = 0; i < numColumns; i++) {
        this.hexBytes.push({
          x: startX + i * columnWidth,
          y: 80,
          text: this.generateRandomHex(4),
          alpha: 1.0,
        });
      }
    }

    // Update and draw hex bytes scrolling down
    this.hexBytes.forEach((byte) => {
      byte.y += 3; // Scroll speed
      byte.alpha = Math.max(0, 1.0 - (byte.y - 80) / 300);

      // Draw with fading effect
      const alpha = Math.round(byte.alpha * 255)
        .toString(16)
        .padStart(2, '0');
      this.spriteEngine.drawText(byte.text, byte.x, byte.y, `#00FF00${alpha}`, 14);
    });

    // Remove off-screen bytes
    const canvasHeight = ctx.canvas?.height ?? 480;
    this.hexBytes = this.hexBytes.filter((byte) => byte.y < canvasHeight);
  }

  private renderTokenCompression(
    _ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number
  ): void {
    const phaseProgress = (this.stageTime - 3.0) / 1.0; // 0 to 1 within this phase

    // Draw title
    this.spriteEngine.drawText('COMPRESSING HASH...', centerX - 160, 50, '#00FF00', 16);

    // Show final token format with compression animation
    const token = '758c519d.02.c16f91';
    const scale = 1 + Math.sin(phaseProgress * Math.PI) * 0.3; // Pulse effect
    const fontSize = Math.round(24 * scale);

    // Draw token in center with glow
    const tokenWidth = token.length * fontSize * 0.6;
    this.spriteEngine.drawText(
      token,
      centerX - tokenWidth / 2,
      centerY - fontSize / 2,
      '#00FFFF',
      fontSize,
      true
    );

    // Draw compression lines converging on token
    const numLines = 8;
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const distance = 150 * (1 - phaseProgress);
      const x1 = centerX + Math.cos(angle) * distance;
      const y1 = centerY + Math.sin(angle) * distance;

      this.spriteEngine.drawLine(x1, y1, centerX, centerY, '#00FFFF', 2, true);
    }

    // Show score popup at end
    if (phaseProgress > 0.7) {
      this.spriteEngine.drawText('+5,000', centerX - 50, centerY + 50, '#FFFF00', 20, true);
    }
  }

  private drawPacMan(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    mouthAngle: number
  ): void {
    ctx.save();

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;

    ctx.beginPath();
    ctx.arc(x, y, radius, mouthAngle, Math.PI * 2 - mouthAngle);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();

    // Draw eye
    ctx.fillStyle = '#000000';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x + radius * 0.3, y - radius * 0.3, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private generateRandomHex(length: number): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  public reset(): void {
    this.stageTime = 0;
    this.chompPlayed = false;
    this.hexBytes = [];
  }
}
