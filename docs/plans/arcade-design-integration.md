# V5 Arcade Generator - Design System Integration

## Integration Strategy

The V5 Arcade Generator builds on the **existing retro design system** in `design/` without replacing it. All arcade-specific enhancements extend the base system.

### Existing Design System (Already Available)

✅ **Colors:**

- Primary cyan (#00FFFF)
- Secondary blue (#0066FF)
- Accent magenta (#FF0099)
- Gold (#FFC300)
- Background gradients

✅ **Typography:**

- Press Start 2P (pixel font)
- VT323 (terminal font) ← Perfect for technical readouts
- Space Mono (body text)
- Orbitron (display headings) ← Perfect for "PAYKEY GENERATOR V5"

✅ **Effects (already in CSS):**

- `--effect-glow-cyan`
- `--effect-glow-blue`
- `--effect-glow-magenta`
- `.scanlines` class
- `.crt-screen` class
- `.retro-card` with neon borders

✅ **Animations:**

- `pulse-glow` (2s cycle)
- `flicker` (0.15s)
- `scan` (8s linear)
- `pixel-fade-in` (0.3s)

### Arcade-Specific Additions

We'll add these to **extend** the existing system:

#### 1. Enhanced Glow Effects

Add to `retro-styles.css`:

```css
/* ARCADE ENHANCEMENT: Multi-layer neon glow (more intense) */
.neon-text-intense {
  text-shadow:
    0 0 2px #ffffff,
    /* Core white */ 0 0 5px var(--color-primary),
    /* Inner glow */ 0 0 10px var(--color-primary),
    /* Outer glow */ 0 0 20px var(--color-primary),
    /* Mid halo */ 0 0 40px rgba(0, 255, 255, 0.3); /* Far halo */
}

/* ARCADE: Neon tube pulsing (like real neon signs) */
@keyframes neon-pulse-intense {
  0%,
  100% {
    filter: brightness(100%);
    text-shadow:
      0 0 10px var(--color-primary),
      0 0 20px var(--color-primary);
  }
  50% {
    filter: brightness(150%);
    text-shadow:
      0 0 20px var(--color-primary),
      0 0 40px var(--color-primary),
      0 0 60px var(--color-primary);
  }
}
```

#### 2. Screen Shake Animation

Add to `retro-styles.css`:

```css
/* ARCADE: Screen shake for impact events */
@keyframes screen-shake {
  0%,
  100% {
    transform: translate(0, 0);
  }
  10% {
    transform: translate(-3px, 2px);
  }
  20% {
    transform: translate(3px, -2px);
  }
  30% {
    transform: translate(-2px, 3px);
  }
  40% {
    transform: translate(2px, -1px);
  }
  50% {
    transform: translate(-1px, 2px);
  }
  60% {
    transform: translate(1px, -2px);
  }
  70% {
    transform: translate(-2px, 1px);
  }
  80% {
    transform: translate(2px, -3px);
  }
  90% {
    transform: translate(-1px, 1px);
  }
}

.screen-shake {
  animation: screen-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
```

#### 3. Chromatic Aberration

Add to `retro-styles.css`:

```css
/* ARCADE: RGB chromatic aberration (CRT effect) */
.chromatic-aberration {
  position: relative;
}

.chromatic-aberration::before,
.chromatic-aberration::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.chromatic-aberration::before {
  color: #ff00ff; /* Magenta channel */
  transform: translate(-2px, 0);
  mix-blend-mode: screen;
  opacity: 0.8;
}

.chromatic-aberration::after {
  color: #00ffff; /* Cyan channel */
  transform: translate(2px, 0);
  mix-blend-mode: screen;
  opacity: 0.8;
}
```

#### 4. Screen Flash Effect

Add to `retro-styles.css`:

```css
/* ARCADE: Full screen flash (for coin insert, score events) */
@keyframes screen-flash {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
  }
}

.screen-flash {
  position: fixed;
  inset: 0;
  background: white;
  pointer-events: none;
  animation: screen-flash 200ms ease-out;
  z-index: 9999;
}

.screen-flash-cyan {
  background: var(--color-primary);
}

.screen-flash-magenta {
  background: var(--color-accent);
}
```

#### 5. Arcade Cabinet Bezel

New component using existing design system:

```tsx
// web/src/components/generator/v5-arcade/ArcadeBezel.tsx
import React from 'react';

export const ArcadeBezel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {/* Top Marquee - Using Orbitron font from design system */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background-elevated to-background-card">
        <div className="flex items-center justify-center h-full">
          <h1 className="font-display text-2xl text-primary neon-text-intense">
            ▓▓▓ PAYKEY GENERATOR V5 ▓▓▓
          </h1>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-[640px] h-[480px] border-4 border-primary/40 shadow-glow-cyan">
        {children}
      </div>

      {/* Bottom Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background-elevated to-background-card">
        <div className="flex items-center justify-center gap-8 h-full">
          {/* Fake coin slot */}
          <div className="w-24 h-2 bg-neutral-700 rounded-full border border-neutral-500" />

          {/* Fake start button */}
          <div className="w-16 h-16 rounded-full bg-accent border-4 border-accent/40 shadow-glow-magenta flex items-center justify-center">
            <span className="font-pixel text-xs text-white">START</span>
          </div>

          {/* Fake player indicators */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-primary shadow-glow-cyan" />
            <div className="w-3 h-3 rounded-full bg-neutral-700" />
          </div>
        </div>
      </div>

      {/* Side panels with Art Deco pattern */}
      <div className="absolute left-0 top-16 bottom-20 w-32 bg-gradient-to-r from-background-dark to-background">
        {/* Decorative geometric pattern */}
        <div
          className="w-full h-full opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, var(--color-primary) 10px, var(--color-primary) 11px)',
          }}
        />
      </div>

      <div className="absolute right-0 top-16 bottom-20 w-32 bg-gradient-to-l from-background-dark to-background">
        <div
          className="w-full h-full opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, transparent, transparent 10px, var(--color-primary) 10px, var(--color-primary) 11px)',
          }}
        />
      </div>
    </div>
  );
};
```

### Component Architecture

#### Reusing Existing Design System

```tsx
// Import existing design system utilities
import { designSystem } from '@/design/retro-design-system';

// Use existing colors
const COLORS = {
  primary: designSystem.colors.primary.DEFAULT, // #00FFFF
  secondary: designSystem.colors.secondary.DEFAULT, // #0066FF
  accent: designSystem.colors.accent.DEFAULT, // #FF0099
  gold: designSystem.colors.gold.DEFAULT, // #FFC300
  background: designSystem.colors.background.DEFAULT, // #0A0E1A
};

// Use existing effects
const EFFECTS = {
  glowCyan: designSystem.effects.glowCyan,
  glowMagenta: designSystem.effects.glowMagenta,
  scanlines: designSystem.effects.scanlines,
  crt: designSystem.effects.crt,
};
```

#### Canvas Sprite Engine Integration

```typescript
// web/src/components/generator/v5-arcade/core/SpriteEngine.ts
import { designSystem } from '@/design/retro-design-system';

export class SpriteEngine {
  private ctx: CanvasRenderingContext2D;

  // Use design system fonts
  private readonly FONTS = {
    pixel: 'Press Start 2P, monospace', // Existing
    terminal: 'VT323, monospace', // Existing
    display: 'Orbitron, sans-serif', // Existing
  };

  // Use design system colors
  private readonly COLORS = {
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    yellow: '#FFFF00',
    green: '#00FF00',
  };

  drawText(
    text: string,
    x: number,
    y: number,
    options?: {
      font?: keyof typeof this.FONTS;
      color?: string;
      size?: number;
      glow?: boolean;
    }
  ) {
    const font = options?.font || 'pixel';
    const color = options?.color || this.COLORS.cyan;
    const size = options?.size || 16;
    const glow = options?.glow !== false;

    this.ctx.save();
    this.ctx.font = `${size}px ${this.FONTS[font]}`;
    this.ctx.fillStyle = color;

    if (glow) {
      // Multi-layer neon glow (enhanced version of design system)
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(text, x, y);
      this.ctx.shadowBlur = 8;
      this.ctx.fillText(text, x, y);
      this.ctx.shadowBlur = 12;
      this.ctx.fillText(text, x, y);
    } else {
      this.ctx.fillText(text, x, y);
    }

    this.ctx.restore();
  }
}
```

### Sound Manager Integration

```typescript
// web/src/components/generator/v5-arcade/audio/SoundManager.ts
export class SoundManager {
  private audioContext: AudioContext | null = null;
  private muted: boolean = false;

  // 8-bit sounds (synthesized) matching retro theme
  play8BitSound(type: 'beep' | 'laser' | 'coin' | 'fanfare') {
    if (this.muted || !this.audioContext) return;

    const sounds = {
      beep: { freq: 800, duration: 0.05, wave: 'square' as OscillatorType },
      laser: { freq: 1200, duration: 0.15, wave: 'sawtooth' as OscillatorType },
      coin: { freq: 1000, duration: 0.3, wave: 'sine' as OscillatorType },
      fanfare: { freq: 1500, duration: 0.5, wave: 'triangle' as OscillatorType },
    };

    const sound = sounds[type];
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = sound.wave;
    oscillator.frequency.setValueAtTime(sound.freq, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + sound.duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + sound.duration);
  }
}
```

## File Structure

```
web/src/components/generator/
├── v5/                          ← OLD (will be deleted)
│   ├── GeneratorModal.tsx       (Three.js/WebGL)
│   ├── Scene.tsx
│   └── stages/
│       ├── Waldo3D.tsx
│       ├── Blake3D.tsx
│       └── Minting3D.tsx
│
└── v5-arcade/                   ← NEW (Canvas 2D arcade)
    ├── GeneratorModal.tsx       # Main component (uses ArcadeBezel)
    ├── ArcadeBezel.tsx          # Cabinet frame (uses design system)
    ├── ArcadeCanvas.tsx         # Canvas wrapper
    ├── ArcadeHeader.tsx         # Marquee animation
    ├── StatusBar.tsx            # HUD (score, stage, combo)
    │
    ├── core/
    │   ├── GameEngine.ts        # Main game loop
    │   ├── SpriteEngine.ts      # Uses design system fonts/colors
    │   └── ParticleSystem.ts    # Explosions, sparkles
    │
    ├── stages/
    │   ├── WaldoStage.ts        # Stage 1 rendering
    │   ├── Blake3Stage.ts       # Stage 2 rendering
    │   └── MintingStage.ts      # Stage 3 rendering
    │
    ├── effects/
    │   ├── CRTEffect.ts         # Scanlines (uses --effect-scanlines)
    │   ├── GlowEffect.ts        # Enhanced neon (extends design system)
    │   └── ChromaticEffect.ts   # RGB split (new)
    │
    └── audio/
        ├── SoundManager.ts      # Web Audio synthesis
        └── sounds.ts            # 8-bit sound definitions
```

## Implementation Strategy

### Phase 1: Foundation (Using Existing System)

1. **Create ArcadeBezel.tsx** - Uses existing:
   - `font-display` (Orbitron)
   - `text-primary`, `shadow-glow-cyan`
   - `bg-gradient-to-b`, `from-background-elevated`
   - `border-4`, `border-primary/40`

2. **Extend retro-styles.css** - Add arcade-specific:
   - `.neon-text-intense`
   - `.screen-shake` animation
   - `.chromatic-aberration`
   - `.screen-flash`

3. **Create SpriteEngine.ts** - Use design system:
   - Import `designSystem` from `@/design/retro-design-system`
   - Use existing colors, fonts
   - Enhance glow effects (multi-layer)

### Phase 2: Arcade Components (New)

4. **GameEngine.ts** - Canvas 2D game loop
5. **CRTEffect.ts** - Use `--effect-scanlines` + barrel distortion
6. **Stages** - WALDO, Blake3, Minting animations
7. **SoundManager.ts** - 8-bit synthesis

### Phase 3: Integration

8. **Replace v5/GeneratorModal.tsx import**
9. **Delete old v5/ directory**
10. **Test with `/demo` command**

## Design Tokens Reference

### From Existing Design System

```typescript
// Colors (DO NOT redefine, use existing)
designSystem.colors.primary.DEFAULT; // #00FFFF
designSystem.colors.accent.DEFAULT; // #FF0099
designSystem.colors.gold.DEFAULT; // #FFC300
designSystem.colors.background.DEFAULT; // #0A0E1A

// Fonts (DO NOT redefine, use existing)
designSystem.typography.fonts.pixel; // Press Start 2P
designSystem.typography.fonts.pixelAlt; // VT323
designSystem.typography.fonts.display; // Orbitron

// Effects (DO NOT redefine, use existing)
designSystem.effects.glowCyan; // Box shadow
designSystem.effects.scanlines; // CSS gradient
```

### Arcade Additions (New)

```typescript
// Extend with arcade-specific
const ARCADE_EFFECTS = {
  neonIntense: 'multi-layer text-shadow',
  screenShake: 'transform animation',
  chromatic: 'RGB channel split',
  flash: 'fullscreen overlay',
};
```

## Summary

**DO:**

- ✅ Use existing design system colors, fonts, effects
- ✅ Extend `retro-styles.css` with arcade additions
- ✅ Import `designSystem` from `@/design/retro-design-system.ts`
- ✅ Use existing classes: `.retro-card`, `.shadow-glow-cyan`, `.font-pixel`
- ✅ Build components that match the retro aesthetic

**DON'T:**

- ❌ Redefine colors (use existing cyan, magenta, gold)
- ❌ Import new fonts (Press Start 2P, VT323, Orbitron already loaded)
- ❌ Create duplicate glow effects (extend existing ones)
- ❌ Ignore the design system (this is about **integration** not replacement)

**Result:**
A cohesive arcade experience that feels like a natural evolution of the existing retro design system, not a separate theme.
