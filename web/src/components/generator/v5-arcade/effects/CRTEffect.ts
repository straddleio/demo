export class CRTEffect {
  private scanlineOpacity: number = 0.15;
  private scanlineInterval: number = 2; // Every 2 pixels

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderScanlines(ctx);
    // Note: Barrel distortion is expensive, skip for now
    // this.applyBarrelDistortion(ctx);
  }

  private renderScanlines(ctx: CanvasRenderingContext2D): void {
    const { width, height } = ctx.canvas;

    ctx.fillStyle = `rgba(0, 0, 0, ${this.scanlineOpacity})`;

    for (let y = 0; y < height; y += this.scanlineInterval) {
      ctx.fillRect(0, y, width, 1);
    }
  }

  // Barrel distortion is expensive - commented out for performance
  // If needed in future, add shouldApplyDistortion and applyBarrelDistortion methods
}
