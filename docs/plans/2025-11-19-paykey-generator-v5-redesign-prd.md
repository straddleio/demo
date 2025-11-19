# Paykey Generator V5 Redesign - PRD & Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the V5 paykey generator into a captivating 1980s arcade-style experience that gamifies the payment verification process with deliberate, clear animations that educate users while entertaining them.

**Architecture:** Replace current 3D WebGL approach with 2D Canvas-based retro arcade graphics. Use sprite-based animations, geometric primitives, and pixel-perfect rendering. Implement a game-loop architecture with scored stages and achievement feedback.

**Tech Stack:**

- Canvas 2D API (replace Three.js/WebGL)
- Framer Motion for overlay animations
- Custom sprite engine for retro graphics
- Sound effects (8-bit bleeps/bloops)
- Score/achievement system

---

## Problem Statement

### Current Issues

The current V5 generator has several problems:

1. **Visual Design Mismatch**: Uses modern 3D WebGL with PBR materials and Bloom effects, which feels too polished and doesn't match the retro gaming aesthetic of the rest of the app
2. **Animation Pacing**: 13-second timeline feels either too slow (when nothing is happening) or too fast (when data transformations fly by without explanation)
3. **Data Clarity**: Users can't understand what's happening - the 3D visualization obscures rather than illuminates the verification process

### What Success Looks Like

**Visual**: Feels like playing Tron or Pac-Man - bold neon colors (cyan, magenta, yellow, green), simple geometric shapes, high contrast, pixel fonts, scanlines, CRT effects

**Animation**: 8-12 seconds total with deliberate pacing where each verification step is visible and understandable

**Data**: Gamified experience with points, visual feedback, achievement unlocks that make the technical process fun and memorable

---

## Design Vision

### Aesthetic Reference

**Primary Inspiration: Tron (1982) + Pac-Man (1980)**

- **Color Palette**:
  - Background: Pure black (#000000)
  - Primary: Electric cyan (#00FFFF)
  - Secondary: Hot magenta (#FF00FF)
  - Accent: Bright yellow (#FFFF00)
  - Success: Lime green (#00FF00)
  - Grid lines: Dark cyan (#004444)

- **Typography**:
  - Primary: "Press Start 2P" (already in app)
  - All caps, monospace
  - Pixel-perfect alignment (8px grid)

- **Effects**:
  - CRT scanlines (1px horizontal lines at 50% opacity)
  - Screen curvature (subtle barrel distortion on edges)
  - Glow effect on all neon elements (2-4px blur)
  - Chromatic aberration on text (1px RGB offset)
  - VHS tracking noise (occasional horizontal glitches)

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓  PAYKEY GENERATOR V5  ▓▓▓▓▓▓▓                  │  ← Header (arcade marquee)
├─────────────────────────────────────────────────────────┤
│                                                          │
│              [MAIN GAME AREA]                            │  ← Canvas (640x480 arcade ratio)
│                                                          │
│         Stage indicator + visual feedback                │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  SCORE: 0000  │  STAGE: 1/3  │  COMBO: x1  │  ★★★☆☆    │  ← Status bar (arcade HUD)
└─────────────────────────────────────────────────────────┘
```

### Animation Philosophy

**8-12 Second Timeline** (target: 10 seconds)

**Stage 1: WALDO Identity Match** (3-4 seconds)

- 0.0-0.5s: Customer name appears letter-by-letter (typewriter)
- 0.5-1.5s: Name "pixelates" then "depixelates" (normalization effect)
- 1.5-2.5s: Show 3-4 name variations as arcade "targets" that get "shot down"
- 2.5-3.5s: Matching name locks in with satisfying "LOCK" sound
- 3.5-4.0s: Score counter rapidly increments (arcade scoring)

**Stage 2: Blake3 Hash Generation** (3-4 seconds)

- 0.0-1.0s: Customer data flies in from edges as geometric shapes
- 1.0-2.0s: Shapes combine in center with Pac-Man style "chomping" animation
- 2.0-3.0s: Hash visualized as scrolling hex bytes (Matrix green rain style)
- 3.0-4.0s: Hash compresses into token format with satisfying "crunch"

**Stage 3: Minting Complete** (2-3 seconds)

- 0.0-1.0s: Token assembles piece-by-piece (Tetris blocks falling)
- 1.0-2.0s: Gold coin "mints" with sparkle effect
- 2.0-2.5s: Achievement unlocked badge appears
- 2.5-3.0s: Final score tallied with fanfare

**Total: 10-11 seconds**

### Gamification Elements

**Scoring System**:

- WALDO match: +100 points per % confidence (up to 10,000)
- Hash generation: +5,000 points (instant)
- Successful mint: +25,000 points (instant)
- Speed bonus: +1,000 per second under 12s
- Perfect run: 2x multiplier

**Visual Feedback**:

- "+100" text flies up from scoring events
- Combo meter fills (visual progress bar)
- Star rating (1-5 stars) based on total score
- Achievement badge at end ("VERIFIED!" "CRYPTO MASTER!" "PERFECT!")

**Sound Design** (8-bit style):

- Typewriter beeps (name appearing)
- "Pew pew" laser (targets eliminated)
- "Lock" click (match confirmed)
- Chomping sound (data combining)
- Coin drop (minting)
- Fanfare melody (completion)

---

## Technical Architecture

### Why Canvas 2D (not WebGL/Three.js)

**Current Problem**: Three.js + React Three Fiber is:

- Overkill for 2D retro graphics
- Harder to pixel-perfect control
- Larger bundle size
- More complex state management
- Doesn't naturally fit arcade aesthetic

**Canvas 2D Benefits**:

- Perfect pixel control (no antialiasing issues)
- Smaller bundle (~50KB vs 600KB)
- Simpler animation loop
- Direct bitmap manipulation for effects
- Easier scanline/CRT overlays

### Component Architecture

```
GeneratorModal (React)
  ├─ ArcadeHeader (React)
  │   └─ Marquee text animation
  │
  ├─ ArcadeCanvas (React + Canvas)
  │   ├─ GameLoop (requestAnimationFrame)
  │   ├─ SpriteEngine
  │   ├─ ParticleSystem
  │   └─ EffectsLayer (scanlines, glow, chromatic)
  │
  ├─ StatusBar (React)
  │   ├─ ScoreDisplay
  │   ├─ StageIndicator
  │   ├─ ComboMeter
  │   └─ StarRating
  │
  └─ SoundManager (Web Audio API)
      └─ 8-bit synthesis
```

### File Structure

```
web/src/components/generator/v5-arcade/
├── GeneratorModal.tsx          # Main container
├── ArcadeCanvas.tsx            # Canvas wrapper + game loop
├── ArcadeHeader.tsx            # Marquee header
├── StatusBar.tsx               # HUD components
│
├── core/
│   ├── GameEngine.ts           # Main game loop + state
│   ├── SpriteEngine.ts         # Sprite rendering
│   ├── ParticleSystem.ts       # Particle effects
│   └── EffectsLayer.ts         # Post-processing
│
├── stages/
│   ├── WaldoStage.ts           # Stage 1 logic + rendering
│   ├── Blake3Stage.ts          # Stage 2 logic + rendering
│   └── MintingStage.ts         # Stage 3 logic + rendering
│
├── effects/
│   ├── CRTEffect.ts            # Scanlines + curvature
│   ├── GlowEffect.ts           # Neon glow
│   └── ChromaticEffect.ts      # RGB split
│
├── audio/
│   ├── SoundManager.ts         # Web Audio synthesis
│   └── sounds.ts               # 8-bit sound definitions
│
└── utils/
    ├── animations.ts           # Easing functions
    ├── sprites.ts              # Sprite definitions
    └── scoring.ts              # Score calculation
```

---

## Data Flow

### Input (from Straddle API via state)

```typescript
interface GeneratorData {
  customerName: string; // "Alberta Bobbeth Charleson"
  waldoData?: {
    correlationScore: number; // 0.98 (98%)
    matchedName?: string; // "ALBERTA B CHARLESON"
  };
  paykeyToken: string; // "758c519d.02.c16f91..."
  accountLast4: string; // "6789"
  routingNumber: string; // "021000021"
}
```

### Stage 1: WALDO Processing

**Visual Representation**:

```
[Customer Name]
ALBERTA BOBBETH CHARLESON
      ↓ (pixelate/depixelate)
[Variations appear as targets]
○ ALBERTA BOBBETH CHARLESON
○ ALBERTA B CHARLESON JR
○ MR ALBERTA CHARLESON
○ CHARLESON, ALBERTA B
      ↓ (laser shoots correct one)
[Match locks]
✓ ALBERTA B CHARLESON
MATCH: 98% [========== ] +9,800
```

### Stage 2: Blake3 Hash

**Visual Representation**:

```
[Data nodes fly in]
 👤 ALBERTA B CHARLESON
 🏦 ACCT ****6789
 📊 WALDO 98%
      ↓ (Pac-Man chomps them together)
[Hash bytes scroll down]
758c519d3a2e...
02c16f91a8b4...
      ↓ (compress)
[Token formed]
758c519d.02.c16f91
         +5,000
```

### Stage 3: Minting

**Visual Representation**:

```
[Tetris blocks fall]
▓▓▓▓
  ▓▓▓▓
    ▓▓▓▓
      ↓ (assemble into coin)
      ╱───╲
     │ 💰 │
     │758c│
      ╲───╱
         ★
    +25,000
─────────────────
FINAL SCORE: 39,800
RATING: ★★★★☆
ACHIEVEMENT: CRYPTO MASTER!
```

---

## Performance Requirements

### Frame Rate

- Target: 60 FPS (16.67ms per frame)
- Acceptable: 30 FPS (33.33ms per frame)
- Critical: No dropped frames during stage transitions

### Bundle Size

- Current V5: ~800KB (Three.js + dependencies)
- Target V5-Arcade: ~200KB (Canvas 2D + minimal deps)
- Reduction: 75% smaller

### Memory Usage

- Canvas buffer: 640x480x4 = ~1.2MB
- Sprite atlas: ~500KB
- Sound buffers: ~100KB
- Total: <2MB (down from ~15MB for WebGL)

### Load Time

- First paint: <500ms
- Interactive: <1000ms
- All assets loaded: <2000ms

---

## Testing Strategy

### Visual Regression Tests

1. Screenshot each stage at key frames
2. Compare against golden images
3. Detect color/layout drift

### Animation Timing Tests

1. Record frame timestamps
2. Verify stage durations (±200ms tolerance)
3. Ensure no animation gaps

### Scoring Logic Tests

1. Unit test score calculations
2. Verify achievement triggers
3. Test edge cases (0% match, 100% match)

### Cross-Browser Tests

- Chrome/Edge (Chromium)
- Firefox
- Safari (Canvas 2D differences)

### Performance Tests

- FPS monitoring during full run
- Memory profiling
- Bundle size verification

---

## Implementation Plan Overview

The detailed implementation is broken into bite-sized tasks in the sections below. Each task follows TDD (write test first, implement, commit).

### Phase 1: Foundation (Tasks 1-5)

- Set up Canvas 2D infrastructure
- Create game loop and sprite engine
- Build CRT effects layer
- Implement sound manager

### Phase 2: Stages (Tasks 6-11)

- Stage 1: WALDO with gamified feedback
- Stage 2: Blake3 hash visualization
- Stage 3: Minting celebration

### Phase 3: Polish (Tasks 12-15)

- Scoring system and achievements
- Sound effects and audio mixing
- Visual effects tuning
- Cross-browser testing

### Phase 4: Integration (Tasks 16-18)

- Replace old V5 generator
- Update tests
- Documentation

---

## Task 1: Create Canvas Infrastructure

**Files:**

- Create: `web/src/components/generator/v5-arcade/ArcadeCanvas.tsx`
- Create: `web/src/components/generator/v5-arcade/core/GameEngine.ts`
- Test: `web/src/components/generator/v5-arcade/__tests__/ArcadeCanvas.test.tsx`

**Step 1: Write failing test**

```typescript
// web/src/components/generator/v5-arcade/__tests__/ArcadeCanvas.test.tsx
import { render, screen } from '@testing-library/react';
import { ArcadeCanvas } from '../ArcadeCanvas';

describe('ArcadeCanvas', () => {
  it('should render canvas with arcade dimensions', () => {
    render(<ArcadeCanvas />);
    const canvas = screen.getByRole('img', { hidden: true });

    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '640');
    expect(canvas).toHaveAttribute('height', '480');
  });

  it('should initialize with black background', () => {
    render(<ArcadeCanvas />);
    const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    // Get pixel at center
    const imageData = ctx!.getImageData(320, 240, 1, 1);
    expect(imageData.data).toEqual(new Uint8ClampedArray([0, 0, 0, 255]));
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test --workspace=web -- ArcadeCanvas.test.tsx
```

Expected: FAIL - "Cannot find module '../ArcadeCanvas'"

**Step 3: Implement ArcadeCanvas component**

```typescript
// web/src/components/generator/v5-arcade/ArcadeCanvas.tsx
import React, { useEffect, useRef } from 'react';

interface Props {
  width?: number;
  height?: number;
}

export const ArcadeCanvas: React.FC<Props> = ({
  width = 640,
  height = 480
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      role="img"
      aria-label="Arcade game canvas"
      style={{
        imageRendering: 'pixelated', // Crisp pixels
        border: '2px solid #00FFFF',
      }}
    />
  );
};
```

**Step 4: Run test to verify it passes**

```bash
npm run test --workspace=web -- ArcadeCanvas.test.tsx
```

Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add web/src/components/generator/v5-arcade/
git commit -m "feat(arcade): add canvas infrastructure with 640x480 arcade dimensions"
```

---

## Task 2: Implement Game Loop

**Files:**

- Create: `web/src/components/generator/v5-arcade/core/GameEngine.ts`
- Modify: `web/src/components/generator/v5-arcade/ArcadeCanvas.tsx`
- Test: `web/src/components/generator/v5-arcade/core/__tests__/GameEngine.test.ts`

**Step 1: Write failing test**

```typescript
// web/src/components/generator/v5-arcade/core/__tests__/GameEngine.test.ts
import { GameEngine } from '../GameEngine';

describe('GameEngine', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let engine: GameEngine;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d')!;
    engine = new GameEngine(ctx);
  });

  afterEach(() => {
    engine.stop();
  });

  it('should start and run update loop', async () => {
    const updateSpy = vi.fn();
    engine.on('update', updateSpy);

    engine.start();

    // Wait for at least 2 frames
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(updateSpy).toHaveBeenCalled();
    expect(updateSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('should provide deltaTime in seconds', async () => {
    let deltaTime = 0;
    engine.on('update', (dt: number) => {
      deltaTime = dt;
    });

    engine.start();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(deltaTime).toBeGreaterThan(0);
    expect(deltaTime).toBeLessThan(0.1); // Should be around 0.016 for 60fps
  });

  it('should stop the game loop', async () => {
    const updateSpy = vi.fn();
    engine.on('update', updateSpy);

    engine.start();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const callCountBeforeStop = updateSpy.mock.calls.length;
    engine.stop();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(updateSpy.mock.calls.length).toBe(callCountBeforeStop);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test --workspace=web -- GameEngine.test.ts
```

Expected: FAIL - "Cannot find module '../GameEngine'"

**Step 3: Implement GameEngine**

```typescript
// web/src/components/generator/v5-arcade/core/GameEngine.ts
type UpdateCallback = (deltaTime: number, totalTime: number) => void;

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private running: boolean = false;
  private lastFrameTime: number = 0;
  private totalTime: number = 0;
  private animationFrameId: number | null = null;
  private listeners: Map<string, UpdateCallback[]> = new Map();

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public start(): void {
    if (this.running) return;

    this.running = true;
    this.lastFrameTime = performance.now();
    this.totalTime = 0;
    this.gameLoop();
  }

  public stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
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
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTimeMs = currentTime - this.lastFrameTime;
    const deltaTime = deltaTimeMs / 1000; // Convert to seconds

    this.lastFrameTime = currentTime;
    this.totalTime += deltaTime;

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Emit update event
    this.emit('update', deltaTime, this.totalTime);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test --workspace=web -- GameEngine.test.ts
```

Expected: PASS (3 tests)

**Step 5: Integrate GameEngine into ArcadeCanvas**

```typescript
// web/src/components/generator/v5-arcade/ArcadeCanvas.tsx (add to existing)
import { GameEngine } from './core/GameEngine';

export const ArcadeCanvas: React.FC<Props> = ({
  width = 640,
  height = 480
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create and start game engine
    engineRef.current = new GameEngine(ctx);
    engineRef.current.start();

    return () => {
      engineRef.current?.stop();
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      role="img"
      aria-label="Arcade game canvas"
      style={{
        imageRendering: 'pixelated',
        border: '2px solid #00FFFF',
      }}
    />
  );
};
```

**Step 6: Commit**

```bash
git add web/src/components/generator/v5-arcade/
git commit -m "feat(arcade): implement game loop with requestAnimationFrame"
```

---

## Task 3: Add CRT Effects Layer

**Files:**

- Create: `web/src/components/generator/v5-arcade/effects/CRTEffect.ts`
- Modify: `web/src/components/generator/v5-arcade/core/GameEngine.ts`
- Test: `web/src/components/generator/v5-arcade/effects/__tests__/CRTEffect.test.ts`

**Step 1: Write failing test**

```typescript
// web/src/components/generator/v5-arcade/effects/__tests__/CRTEffect.test.ts
import { CRTEffect } from '../CRTEffect';

describe('CRTEffect', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let effect: CRTEffect;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d')!;
    effect = new CRTEffect();
  });

  it('should render scanlines at correct interval', () => {
    // Fill canvas with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 640, 480);

    effect.render(ctx);

    // Check scanline pattern (every 2 pixels)
    const imageData = ctx.getImageData(0, 0, 640, 480);

    // Line 0 should be darker (scanline)
    const line0 = imageData.data.slice(0, 640 * 4);
    expect(line0[0]).toBeLessThan(255); // RGB should be darker

    // Line 1 should be original (no scanline)
    const line1 = imageData.data.slice(640 * 4, 640 * 4 * 2);
    expect(line1[0]).toBe(255); // RGB unchanged
  });

  it('should apply barrel distortion near edges', () => {
    const getShouldDistort = (effect as any).shouldApplyDistortion;

    // Center should not distort
    expect(getShouldDistort(320, 240, 640, 480)).toBe(false);

    // Corners should distort
    expect(getShouldDistort(10, 10, 640, 480)).toBe(true);
    expect(getShouldDistort(630, 470, 640, 480)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test --workspace=web -- CRTEffect.test.ts
```

Expected: FAIL - "Cannot find module '../CRTEffect'"

**Step 3: Implement CRTEffect**

```typescript
// web/src/components/generator/v5-arcade/effects/CRTEffect.ts
export class CRTEffect {
  private scanlineOpacity: number = 0.15;
  private scanlineInterval: number = 2; // Every 2 pixels
  private distortionAmount: number = 0.02; // 2% barrel distortion

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

  private shouldApplyDistortion(x: number, y: number, width: number, height: number): boolean {
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));

    // Only distort outer 30% of screen
    return distance / maxDistance > 0.7;
  }

  // Barrel distortion is expensive, implement later if needed
  // private applyBarrelDistortion(ctx: CanvasRenderingContext2D): void { ... }
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test --workspace=web -- CRTEffect.test.ts
```

Expected: PASS (2 tests)

**Step 5: Integrate CRTEffect into GameEngine**

```typescript
// web/src/components/generator/v5-arcade/core/GameEngine.ts (modify)
import { CRTEffect } from '../effects/CRTEffect';

export class GameEngine {
  private crtEffect: CRTEffect;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.crtEffect = new CRTEffect();
  }

  private gameLoop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTimeMs = currentTime - this.lastFrameTime;
    const deltaTime = deltaTimeMs / 1000;

    this.lastFrameTime = currentTime;
    this.totalTime += deltaTime;

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Emit update event for game logic
    this.emit('update', deltaTime, this.totalTime);

    // Apply CRT effects as post-processing
    this.crtEffect.render(this.ctx);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
}
```

**Step 6: Commit**

```bash
git add web/src/components/generator/v5-arcade/
git commit -m "feat(arcade): add CRT scanline effect for retro aesthetic"
```

---

## Task 4: Implement Sound Manager

**Files:**

- Create: `web/src/components/generator/v5-arcade/audio/SoundManager.ts`
- Create: `web/src/components/generator/v5-arcade/audio/sounds.ts`
- Test: `web/src/components/generator/v5-arcade/audio/__tests__/SoundManager.test.ts`

**Step 1: Write failing test**

```typescript
// web/src/components/generator/v5-arcade/audio/__tests__/SoundManager.test.ts
import { SoundManager } from '../SoundManager';

describe('SoundManager', () => {
  let soundManager: SoundManager;

  beforeEach(() => {
    soundManager = new SoundManager();
  });

  afterEach(() => {
    soundManager.cleanup();
  });

  it('should play beep sound', () => {
    const playSpy = vi.spyOn(AudioContext.prototype, 'createOscillator');

    soundManager.play('beep');

    expect(playSpy).toHaveBeenCalled();
  });

  it('should play laser sound with correct frequency', () => {
    const createOscillator = vi.spyOn(AudioContext.prototype, 'createOscillator');

    soundManager.play('laser');

    expect(createOscillator).toHaveBeenCalled();
  });

  it('should respect mute setting', () => {
    soundManager.setMuted(true);
    const playSpy = vi.spyOn(AudioContext.prototype, 'createOscillator');

    soundManager.play('beep');

    expect(playSpy).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test --workspace=web -- SoundManager.test.ts
```

Expected: FAIL - "Cannot find module '../SoundManager'"

**Step 3: Implement SoundManager**

```typescript
// web/src/components/generator/v5-arcade/audio/sounds.ts
export interface Sound {
  type: 'beep' | 'laser' | 'lock' | 'chomp' | 'coin' | 'fanfare';
  frequency: number;
  duration: number;
  volume: number;
  waveform: OscillatorType;
}

export const SOUNDS: Record<string, Sound> = {
  beep: {
    type: 'beep',
    frequency: 800,
    duration: 0.05,
    volume: 0.3,
    waveform: 'square',
  },
  laser: {
    type: 'laser',
    frequency: 1200,
    duration: 0.15,
    volume: 0.4,
    waveform: 'sawtooth',
  },
  lock: {
    type: 'lock',
    frequency: 600,
    duration: 0.2,
    volume: 0.5,
    waveform: 'triangle',
  },
  chomp: {
    type: 'chomp',
    frequency: 400,
    duration: 0.1,
    volume: 0.4,
    waveform: 'square',
  },
  coin: {
    type: 'coin',
    frequency: 1000,
    duration: 0.3,
    volume: 0.5,
    waveform: 'sine',
  },
  fanfare: {
    type: 'fanfare',
    frequency: 1500,
    duration: 0.5,
    volume: 0.6,
    waveform: 'triangle',
  },
};
```

```typescript
// web/src/components/generator/v5-arcade/audio/SoundManager.ts
import { SOUNDS, Sound } from './sounds';

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Lazy init AudioContext (requires user interaction)
    if (typeof window !== 'undefined') {
      this.audioContext = new AudioContext();
    }
  }

  public play(soundName: keyof typeof SOUNDS): void {
    if (this.muted || !this.audioContext) return;

    const sound = SOUNDS[soundName];
    if (!sound) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = sound.waveform;
    oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(sound.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + sound.duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + sound.duration);
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test --workspace=web -- SoundManager.test.ts
```

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add web/src/components/generator/v5-arcade/audio/
git commit -m "feat(arcade): add 8-bit sound synthesis with Web Audio API"
```

---

## Task 5: Build Sprite Engine

**Files:**

- Create: `web/src/components/generator/v5-arcade/core/SpriteEngine.ts`
- Create: `web/src/components/generator/v5-arcade/utils/sprites.ts`
- Test: `web/src/components/generator/v5-arcade/core/__tests__/SpriteEngine.test.ts`

**Step 1: Write failing test**

```typescript
// web/src/components/generator/v5-arcade/core/__tests__/SpriteEngine.test.ts
import { SpriteEngine } from '../SpriteEngine';

describe('SpriteEngine', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let engine: SpriteEngine;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    ctx = canvas.getContext('2d')!;
    engine = new SpriteEngine(ctx);
  });

  it('should draw text with arcade font', () => {
    const fillTextSpy = vi.spyOn(ctx, 'fillText');

    engine.drawText('HELLO', 100, 100, '#00FFFF', 24);

    expect(fillTextSpy).toHaveBeenCalledWith('HELLO', 100, 100);
    expect(ctx.fillStyle).toBe('#00ffff');
    expect(ctx.font).toContain('Press Start 2P');
  });

  it('should draw rectangle with neon glow', () => {
    const fillRectSpy = vi.spyOn(ctx, 'fillRect');
    const shadowColor = vi.spyOn(ctx, 'shadowColor', 'set');

    engine.drawRect(50, 50, 100, 100, '#FF00FF', true);

    expect(shadowColor).toHaveBeenCalledWith('#FF00FF');
    expect(fillRectSpy).toHaveBeenCalledWith(50, 50, 100, 100);
  });

  it('should draw circle sprite', () => {
    const arcSpy = vi.spyOn(ctx, 'arc');

    engine.drawCircle(200, 200, 50, '#FFFF00');

    expect(arcSpy).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test --workspace=web -- SpriteEngine.test.ts
```

Expected: FAIL - "Cannot find module '../SpriteEngine'"

**Step 3: Implement SpriteEngine**

```typescript
// web/src/components/generator/v5-arcade/utils/sprites.ts
export const SPRITE_CONFIG = {
  font: {
    family: '"Press Start 2P", monospace',
    sizes: {
      small: 12,
      medium: 16,
      large: 24,
      xlarge: 32,
    },
  },
  glow: {
    blur: 4,
    offsetX: 0,
    offsetY: 0,
  },
  colors: {
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    yellow: '#FFFF00',
    green: '#00FF00',
    white: '#FFFFFF',
    black: '#000000',
  },
};
```

```typescript
// web/src/components/generator/v5-arcade/core/SpriteEngine.ts
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
```

**Step 4: Run test to verify it passes**

```bash
npm run test --workspace=web -- SpriteEngine.test.ts
```

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add web/src/components/generator/v5-arcade/
git commit -m "feat(arcade): add sprite engine for text, shapes with neon glow"
```

---

## Tasks 6-18: Remaining Implementation

**Due to length constraints, the remaining tasks follow the same pattern:**

### Task 6: Stage 1 - WALDO Identity Match

- Implement typewriter name animation
- Add pixelate/depixelate effect
- Create target shooting mechanic
- Add scoring feedback

### Task 7: Stage 2 - Blake3 Hash Generation

- Implement data node fly-in
- Add Pac-Man chomp animation
- Create scrolling hex bytes effect
- Add hash compression visual

### Task 8: Stage 3 - Minting Complete

- Implement Tetris block falling
- Add coin minting animation
- Create sparkle effect
- Add achievement badge

### Task 9: Scoring System

- Implement score calculation
- Add combo multiplier
- Create star rating logic
- Add visual score popups

### Task 10: Status Bar Components

- Build ScoreDisplay component
- Add StageIndicator
- Create ComboMeter
- Implement StarRating

### Task 11: Arcade Header

- Create marquee text animation
- Add border decoration
- Implement title glow effect

### Task 12: Particle System

- Build particle emitter
- Add explosion effects
- Create sparkle particles
- Implement trail effects

### Task 13: Sound Integration

- Wire sound triggers to animations
- Add audio mixing
- Implement mute toggle
- Test cross-browser audio

### Task 14: Performance Optimization

- Profile frame rate
- Optimize draw calls
- Implement object pooling
- Reduce garbage collection

### Task 15: Cross-Browser Testing

- Test on Chrome/Edge
- Test on Firefox
- Test on Safari
- Fix browser-specific issues

### Task 16: Replace Old V5 with Arcade Version

**Files:**

- Modify: `web/src/components/PaykeyGeneratorModal.tsx:9`
- Delete: `web/src/components/generator/v5/` (entire directory)
- Keep: `web/src/components/generator/v5-arcade/` (new implementation)
- Test: Manual E2E test with `/demo` command

**Step 1: Write integration test**

```typescript
// web/src/components/__tests__/PaykeyGeneratorModal.test.tsx (add test)
import { PaykeyGeneratorModal } from '../PaykeyGeneratorModal';

describe('PaykeyGeneratorModal - Arcade Version', () => {
  it('should render arcade canvas instead of WebGL', () => {
    const { container } = render(<PaykeyGeneratorModal />);

    // Should have canvas with arcade dimensions
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '640');
    expect(canvas).toHaveAttribute('height', '480');

    // Should NOT have Three.js WebGL canvas
    const webglCanvas = container.querySelector('canvas[data-engine="three.js r181"]');
    expect(webglCanvas).not.toBeInTheDocument();
  });

  it('should use arcade version export', () => {
    // This test ensures we imported from v5-arcade, not v5
    const { container } = render(<PaykeyGeneratorModal />);

    // Arcade version should have CRT border
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveStyle({ border: '2px solid #00FFFF' });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test --workspace=web -- PaykeyGeneratorModal.test.tsx
```

Expected: FAIL - Test fails because still using old V5 WebGL version

**Step 3: Update import to use arcade version**

```typescript
// web/src/components/PaykeyGeneratorModal.tsx (REPLACE ENTIRE FILE)
/**
 * Paykey Generator Modal
 *
 * Re-exports the V5-Arcade GeneratorModal.
 * Features 1980s arcade aesthetic using Canvas 2D, gamified scoring,
 * and 8-bit sound effects for an engaging verification experience.
 */

export { ArcadeGeneratorModal as PaykeyGeneratorModal } from './generator/v5-arcade/GeneratorModal';
```

**Step 4: Delete old V5 directory**

```bash
# Verify what will be deleted
ls -R web/src/components/generator/v5/

# Expected output:
# animationUtils.ts
# CyberBackground.tsx
# GeneratorModal.tsx
# Scene.tsx
# stages/Blake3D.tsx
# stages/Minting3D.tsx
# stages/Waldo3D.tsx
# stages/WaldoStage.tsx

# Delete the entire v5 directory
rm -rf web/src/components/generator/v5/
```

**Step 5: Verify arcade directory remains**

```bash
ls -R web/src/components/generator/v5-arcade/

# Expected output should include:
# ArcadeCanvas.tsx
# ArcadeHeader.tsx
# GeneratorModal.tsx (exports as ArcadeGeneratorModal)
# StatusBar.tsx
# core/GameEngine.ts
# core/SpriteEngine.ts
# stages/WaldoStage.ts
# stages/Blake3Stage.ts
# stages/MintingStage.ts
# effects/CRTEffect.ts
# audio/SoundManager.ts
```

**Step 6: Run test to verify it passes**

```bash
npm run test --workspace=web -- PaykeyGeneratorModal.test.tsx
```

Expected: PASS - Canvas with arcade dimensions detected, no WebGL

**Step 7: Manual E2E test**

```bash
# Start the app
npm run dev

# In browser at http://localhost:5173, type in terminal:
/demo

# Expected behavior:
# 1. Arcade-style generator appears (black background, cyan border)
# 2. Stage 1: WALDO - typewriter name, target shooting (3-4s)
# 3. Stage 2: Blake3 - Pac-Man chomp, hex scroll (3-4s)
# 4. Stage 3: Minting - coin drop, achievement badge (2-3s)
# 5. Total time: 8-12 seconds
# 6. Hear 8-bit sound effects throughout
# 7. See score counting up in status bar
# 8. Final star rating appears

# Verify:
# - No black screen freeze
# - Smooth 60fps animation
# - Clear understanding of each verification step
# - Fun, engaging experience
```

**Step 8: Verify bundle size reduction**

```bash
npm run build

# Check bundle sizes
ls -lh web/dist/assets/*.js | grep -i generator

# Expected:
# Old V5: ~800KB (with Three.js)
# New V5-Arcade: ~200KB (Canvas 2D only)
# Reduction: 75% smaller
```

**Step 9: Commit the replacement**

```bash
git add web/src/components/PaykeyGeneratorModal.tsx
git add web/src/components/__tests__/PaykeyGeneratorModal.test.tsx
git add -u web/src/components/generator/v5/  # Stage deletions
git commit -m "feat(arcade): replace V5 WebGL with arcade Canvas 2D version

- Switched from Three.js/WebGL to Canvas 2D for retro aesthetic
- 75% bundle size reduction (800KB -> 200KB)
- Improved animation pacing (13s -> 10s deliberate flow)
- Added gamification (scoring, achievements, 8-bit sounds)
- Better data clarity with educational stage animations"
```

**Important Notes:**

1. **The new arcade implementation MUST export as `ArcadeGeneratorModal`** in `web/src/components/generator/v5-arcade/GeneratorModal.tsx`:

```typescript
// web/src/components/generator/v5-arcade/GeneratorModal.tsx
export const ArcadeGeneratorModal: React.FC = () => {
  // Arcade implementation
  return (
    <div>
      <ArcadeHeader />
      <ArcadeCanvas />
      <StatusBar />
    </div>
  );
};
```

2. **Package.json changes**: After deleting V5, these dependencies can be removed:
   - `@react-three/fiber`
   - `@react-three/drei`
   - `@react-three/postprocessing`
   - `three` (if not used elsewhere)
   - `@types/three`

Run: `npm uninstall @react-three/fiber @react-three/drei @react-three/postprocessing three @types/three --workspace=web`

3. **Rollback**: If arcade version fails, old V5 is in git at commit `675f2eb`:
   ```bash
   git checkout 675f2eb -- web/src/components/generator/v5/
   git checkout 675f2eb -- web/src/components/PaykeyGeneratorModal.tsx
   ```

### Task 17: Update Tests

- Update PaykeyGeneratorModal tests
- Add integration tests
- Update visual regression tests
- Verify 100% coverage

### Task 18: Documentation

- Write user guide
- Document API
- Create troubleshooting guide
- Add performance benchmarks

---

## Success Metrics

### User Experience

- ✅ Visually matches 1980s arcade aesthetic
- ✅ 8-12 second deliberate animation pacing
- ✅ Clear understanding of verification process
- ✅ Fun, memorable gamified experience
- ✅ Smooth 60 FPS performance

### Technical

- ✅ Bundle size <200KB (down from 800KB)
- ✅ No dropped frames on modern browsers
- ✅ All tests passing (unit + integration)
- ✅ Cross-browser compatible
- ✅ Memory usage <2MB

### Business

- ✅ Increased demo engagement time
- ✅ Higher "wow factor" rating
- ✅ More memorable brand experience
- ✅ Easier to explain verification process

---

## Rollback Plan

If V5-Arcade doesn't meet requirements:

1. Old V5 WebGL is still in git history (commit `675f2eb`)
2. Can revert with: `git revert HEAD --no-commit`
3. Or cherry-pick specific improvements back to old V5
4. All tests should still pass on old version

---

## Questions for Implementation Team

Before starting, clarify:

1. **Sound Toggle**: Should mute be persistent (localStorage) or session-only?
2. **Achievement Badges**: Should we track/display historical achievements?
3. **Skip Animation**: Should users be able to skip/speed up the animation?
4. **Mobile Support**: Should this work on mobile/tablet or desktop-only?
5. **Accessibility**: Any WCAG requirements for screen readers?

---

## Appendix: Color Palette Reference

```css
--arcade-black: #000000;
--arcade-cyan: #00ffff;
--arcade-magenta: #ff00ff;
--arcade-yellow: #ffff00;
--arcade-green: #00ff00;
--arcade-white: #ffffff;
--arcade-grid: #004444;
--arcade-shadow: rgba(0, 255, 255, 0.5);
```

## Appendix: Animation Timing Reference

```
Stage 1: WALDO (4 seconds)
├─ 0.0-0.5s: Typewriter name entry
├─ 0.5-1.5s: Pixelate/depixelate
├─ 1.5-2.5s: Target shooting
├─ 2.5-3.5s: Lock confirmation
└─ 3.5-4.0s: Score increment

Stage 2: Blake3 (4 seconds)
├─ 0.0-1.0s: Data fly-in
├─ 1.0-2.0s: Pac-Man chomp
├─ 2.0-3.0s: Hex scroll
└─ 3.0-4.0s: Hash compress

Stage 3: Minting (3 seconds)
├─ 0.0-1.0s: Tetris blocks
├─ 1.0-2.0s: Coin mint
└─ 2.0-3.0s: Achievement

Total: 11 seconds (within 8-12s target)
```
