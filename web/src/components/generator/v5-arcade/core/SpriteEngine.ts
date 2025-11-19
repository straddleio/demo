import { SPRITE_CONFIG } from '../utils/sprites';

export class SpriteEngine {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    color: string,
    size: number = SPRITE_CONFIG.font.sizes.medium,
    glow: boolean = true
  ): void {
    this.ctx.save();

    this.ctx.font = `${size}px ${SPRITE_CONFIG.font.family}`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    if (glow) {
      this.ctx.shadowColor = color;
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
}
