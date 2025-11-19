// web/src/components/generator/v5-arcade/core/SpriteEngine.ts
import { SPRITE_CONFIG } from '../utils/sprites';

interface TextDrawCall {
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  glow: boolean;
}

interface RectDrawCall {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  glow: boolean;
}

interface CircleDrawCall {
  x: number;
  y: number;
  radius: number;
  color: string;
  glow: boolean;
}

interface LineDrawCall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  glow: boolean;
}

export class SpriteEngine {
  private ctx: CanvasRenderingContext2D;
  private textBatch: TextDrawCall[] = [];
  private rectBatch: RectDrawCall[] = [];
  private circleBatch: CircleDrawCall[] = [];
  private lineBatch: LineDrawCall[] = [];
  private batchingEnabled: boolean = true;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public enableBatching(enabled: boolean): void {
    this.batchingEnabled = enabled;
    if (!enabled) {
      this.flush();
    }
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    color: string,
    size: number = SPRITE_CONFIG.font.sizes.medium,
    glow: boolean = true
  ): void {
    if (this.batchingEnabled) {
      this.textBatch.push({ text, x, y, color, size, glow });
      return;
    }

    this.ctx.save();

    this.ctx.font = `${size}px ${SPRITE_CONFIG.font.family}`;
    this.ctx.fillStyle = color.toLowerCase();
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    if (glow) {
      this.ctx.shadowColor = color.toLowerCase();
      this.ctx.shadowBlur = SPRITE_CONFIG.glow.blur;
    }

    this.ctx.fillText(text, x, y);

    this.ctx.restore();
  }

  public drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    glow: boolean = false
  ): void {
    if (this.batchingEnabled) {
      this.rectBatch.push({ x, y, width, height, color, glow });
      return;
    }

    this.ctx.save();

    this.ctx.fillStyle = color;

    if (glow) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = SPRITE_CONFIG.glow.blur;
    }

    this.ctx.fillRect(x, y, width, height);

    this.ctx.restore();
  }

  public drawCircle(
    x: number,
    y: number,
    radius: number,
    color: string,
    glow: boolean = false
  ): void {
    if (this.batchingEnabled) {
      this.circleBatch.push({ x, y, radius, color, glow });
      return;
    }

    this.ctx.save();

    this.ctx.fillStyle = color;

    if (glow) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = SPRITE_CONFIG.glow.blur;
    }

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  public drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width: number = 2,
    glow: boolean = false
  ): void {
    if (this.batchingEnabled) {
      this.lineBatch.push({ x1, y1, x2, y2, color, width, glow });
      return;
    }

    this.ctx.save();

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;

    if (glow) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = SPRITE_CONFIG.glow.blur;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();

    this.ctx.restore();
  }

  public flush(): void {
    // Flush text batch
    if (this.textBatch.length > 0) {
      this.ctx.save();
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';

      for (const call of this.textBatch) {
        this.ctx.font = `${call.size}px ${SPRITE_CONFIG.font.family}`;
        this.ctx.fillStyle = call.color.toLowerCase();

        if (call.glow) {
          this.ctx.shadowColor = call.color.toLowerCase();
          this.ctx.shadowBlur = SPRITE_CONFIG.glow.blur;
        } else {
          this.ctx.shadowBlur = 0;
        }

        this.ctx.fillText(call.text, call.x, call.y);
      }

      this.ctx.restore();
      this.textBatch = [];
    }

    // Flush rect batch
    if (this.rectBatch.length > 0) {
      this.ctx.save();

      for (const call of this.rectBatch) {
        this.ctx.fillStyle = call.color;

        if (call.glow) {
          this.ctx.shadowColor = call.color;
          this.ctx.shadowBlur = SPRITE_CONFIG.glow.blur;
        } else {
          this.ctx.shadowBlur = 0;
        }

        this.ctx.fillRect(call.x, call.y, call.width, call.height);
      }

      this.ctx.restore();
      this.rectBatch = [];
    }

    // Flush circle batch
    if (this.circleBatch.length > 0) {
      this.ctx.save();

      for (const call of this.circleBatch) {
        this.ctx.fillStyle = call.color;

        if (call.glow) {
          this.ctx.shadowColor = call.color;
          this.ctx.shadowBlur = SPRITE_CONFIG.glow.blur;
        } else {
          this.ctx.shadowBlur = 0;
        }

        this.ctx.beginPath();
        this.ctx.arc(call.x, call.y, call.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
      this.circleBatch = [];
    }

    // Flush line batch
    if (this.lineBatch.length > 0) {
      this.ctx.save();

      for (const call of this.lineBatch) {
        this.ctx.strokeStyle = call.color;
        this.ctx.lineWidth = call.width;

        if (call.glow) {
          this.ctx.shadowColor = call.color;
          this.ctx.shadowBlur = SPRITE_CONFIG.glow.blur;
        } else {
          this.ctx.shadowBlur = 0;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(call.x1, call.y1);
        this.ctx.lineTo(call.x2, call.y2);
        this.ctx.stroke();
      }

      this.ctx.restore();
      this.lineBatch = [];
    }
  }
}
