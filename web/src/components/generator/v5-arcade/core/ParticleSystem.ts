type ParticleType = 'explosion' | 'sparkle' | 'trail';

interface Particle {
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  life: number; // 0-1 (1 = born, 0 = dead)
  maxLife: number; // total lifespan in seconds
  color: string;
  size: number;
  type: ParticleType;
  active: boolean;
}

export class ParticleSystem {
  private ctx: CanvasRenderingContext2D;
  private pool: Particle[] = [];
  private readonly MAX_PARTICLES = 500;
  private readonly GRAVITY = 300; // pixels per second^2 (for explosions)

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.initializePool();
  }

  private initializePool(): void {
    // Pre-allocate particle pool to avoid GC thrashing
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.pool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        color: '#FFFFFF',
        size: 4,
        type: 'explosion',
        active: false,
      });
    }
  }

  private getInactiveParticle(): Particle | null {
    for (const particle of this.pool) {
      if (!particle.active) {
        return particle;
      }
    }
    return null;
  }

  private activateParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    color: string,
    size: number,
    type: ParticleType
  ): void {
    const particle = this.getInactiveParticle();
    if (!particle) {
      return; // Pool exhausted
    }

    particle.x = x;
    particle.y = y;
    particle.vx = vx;
    particle.vy = vy;
    particle.life = 1.0;
    particle.maxLife = life;
    particle.color = color;
    particle.size = size;
    particle.type = type;
    particle.active = true;
  }

  public emitExplosion(x: number, y: number, count: number, color: string): void {
    const minSpeed = 50;
    const maxSpeed = 200;
    const minLife = 0.8;
    const maxLife = 1.5;
    const minSize = 3;
    const maxSize = 8;

    for (let i = 0; i < count; i++) {
      // Random angle in all directions
      const angle = Math.random() * Math.PI * 2;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const life = minLife + Math.random() * (maxLife - minLife);
      const size = minSize + Math.random() * (maxSize - minSize);

      this.activateParticle(x, y, vx, vy, life, color, size, 'explosion');
    }
  }

  public emitSparkle(x: number, y: number, count: number): void {
    const colors = ['#FFC300', '#00FFFF']; // Gold and cyan sparkles
    const minSpeed = 20;
    const maxSpeed = 80;
    const life = 0.5; // Short-lived
    const minSize = 2;
    const maxSize = 5;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = minSize + Math.random() * (maxSize - minSize);

      this.activateParticle(x, y, vx, vy, life, color, size, 'sparkle');
    }
  }

  public emitTrail(x: number, y: number, vx: number, vy: number): void {
    const count = 2; // Few trail particles per call
    const life = 0.3; // Quick fade
    const size = 3;
    const color = '#FFFFFF';

    for (let i = 0; i < count; i++) {
      // Inherit velocity with some randomness
      const trailVx = vx * 0.5 + (Math.random() - 0.5) * 20;
      const trailVy = vy * 0.5 + (Math.random() - 0.5) * 20;

      this.activateParticle(x, y, trailVx, trailVy, life, color, size, 'trail');
    }
  }

  public update(deltaTime: number): void {
    for (const particle of this.pool) {
      if (!particle.active) {
        continue;
      }

      // Update position based on velocity
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;

      // Apply gravity to explosion particles
      if (particle.type === 'explosion') {
        particle.vy += this.GRAVITY * deltaTime;
      }

      // Decrease life (normalized to 0-1)
      particle.life -= deltaTime / particle.maxLife;

      // Deactivate dead particles
      if (particle.life <= 0) {
        particle.active = false;
      }
    }
  }

  public render(): void {
    for (const particle of this.pool) {
      if (!particle.active) {
        continue;
      }

      this.ctx.save();

      // Apply alpha fade based on life (ease-out curve)
      const easedLife = this.easeOutQuad(particle.life);
      this.ctx.globalAlpha = easedLife;

      // Scale size based on life (shrink as it dies)
      const currentSize = particle.size * (0.5 + easedLife * 0.5);

      // Draw particle as circle
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  public getActiveCount(): number {
    return this.pool.filter((p) => p.active).length;
  }

  // Easing function for smooth fade-out
  private easeOutQuad(t: number): number {
    return t * (2 - t);
  }
}
