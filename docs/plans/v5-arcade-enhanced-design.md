# V5 Arcade Generator - Enhanced Design Document

> **Design Philosophy:** Not just "retro-styled" but an AUTHENTIC arcade cabinet experience. Users should feel like they walked up to a physical cabinet, dropped a quarter, and are experiencing a custom-built arcade game.

## The Unforgettable Hook

**What makes this memorable:** You're not watching a loading animation - you're PLAYING an arcade game about your payment verification.

### Opening Experience (0-2 seconds)

**"INSERT COIN" Intro:**

```
[Screen flickers to life]
┌─────────────────────────────────────────┐
│                                          │
│         ▓▓ PAYKEY GENERATOR ▓▓           │
│              [  V.5.0  ]                 │
│                                          │
│         [  PRESS START  ]                │  ← Blink at 2Hz
│                                          │
│         1 CREDIT = 1 VERIFICATION        │
│                                          │
└─────────────────────────────────────────┘

[Auto-starts after 1.5s or on any click]
[Sound: Coin drop + mechanical "ka-chunk"]
[Screen flash WHITE for 50ms]
[TEXT: "PLAYER 1 READY" appears bottom-right]
```

**Physical Cabinet Feel:**

- Screen dims to 70% brightness initially
- Brightens to 100% when "coin inserted"
- Subtle barrel distortion (CRT bulge)
- **Bezel overlay** with fake arcade cabinet edge

## Visual Design Enhancements

### 1. Arcade Cabinet Framing

**Full Cabinet Bezel:**

```
┌────────┬─────────────────────────────────────┬────────┐
│        │  ▓▓▓ PAYKEY GENERATOR V5 ▓▓▓        │        │
│ SIDE   ├─────────────────────────────────────┤  SIDE  │
│ PANEL  │                                     │ PANEL  │
│        │         [MAIN CANVAS]               │        │
│  ART   │         640x480 game                │  ART   │
│        │                                     │        │
│ (fake  ├─────────────────────────────────────┤ (fake  │
│  trim) │ SCORE  │ STAGE │ COMBO │ ★★★☆☆     │ trim)  │
└────────┴─────────────────────────────────────┴────────┘
         │                                     │
         │        [  COIN SLOT  ]              │  ← Decorative
         │     [◉]  [  START  ]  [◉]           │  ← Control panel
         └─────────────────────────────────────┘
```

**Bezel Details:**

- **Side panels:** Dark gradient (#000 → #111) with subtle noise texture
- **Top marquee:** Gradient background with animated light strips (like backlit plexiglass)
- **Control panel:** Fake button graphics (Start, Coin, P1/P2) with LED indicators
- **Corner accents:** Art Deco geometric patterns in cyan/magenta

### 2. Enhanced Color System

**Beyond the base palette, add dynamic color behaviors:**

```css
/* Base colors from PRD */
--neon-cyan: #00ffff;
--neon-magenta: #ff00ff;
--neon-yellow: #ffff00;
--neon-green: #00ff00;

/* ENHANCEMENT: Neon tube simulation */
--neon-cyan-core: #ffffff; /* Bright white center */
--neon-cyan-inner: #80ffff; /* Inner glow */
--neon-cyan-outer: #00ffff; /* Outer glow */
--neon-cyan-halo: rgba(0, 255, 255, 0.3); /* Far halo */

/* Multi-layer glow rendering */
.neon-text {
  color: var(--neon-cyan-core);
  text-shadow:
    0 0 2px var(--neon-cyan-core),
    /* Core white */ 0 0 5px var(--neon-cyan-inner),
    /* Inner glow */ 0 0 10px var(--neon-cyan-outer),
    /* Outer glow */ 0 0 20px var(--neon-cyan-outer),
    /* Mid halo */ 0 0 40px var(--neon-cyan-halo); /* Far halo */
}

/* Color cycling (like real arcade attract mode) */
@keyframes neon-pulse {
  0%,
  100% {
    filter: brightness(100%);
  }
  50% {
    filter: brightness(130%);
  }
}

@keyframes attract-mode-cycle {
  0% {
    color: var(--neon-cyan);
  }
  25% {
    color: var(--neon-magenta);
  }
  50% {
    color: var(--neon-yellow);
  }
  75% {
    color: var(--neon-green);
  }
  100% {
    color: var(--neon-cyan);
  }
}
```

### 3. Typography Hierarchy

**Multi-font system for authenticity:**

```css
/* PRIMARY: Press Start 2P for game text */
--font-game: 'Press Start 2P', monospace;

/* SECONDARY: VT323 for technical readouts */
/* (This is an authentic 1980s VT220 terminal font) */
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
--font-terminal: 'VT323', monospace;

/* ACCENT: Orbitron for sci-fi elements (Tron-like) */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');
--font-display: 'Orbitron', sans-serif;

/* SIZE SCALE (8px grid) */
--text-xs: 8px; /* Meta info */
--text-sm: 12px; /* Body text */
--text-md: 16px; /* Headings */
--text-lg: 24px; /* Titles */
--text-xl: 32px; /* Hero text */
```

**Usage:**

- **Game messages:** Press Start 2P (e.g., "WALDO MATCH", "+100 POINTS")
- **Technical data:** VT323 (e.g., hash values, timestamps, debug info)
- **Display titles:** Orbitron (e.g., "PAYKEY GENERATOR V5", stage names)

### 4. CRT Effects - AGGRESSIVE Implementation

**Multi-layer post-processing:**

```typescript
// CRT Effect Stack (applied in order)
1. Scanlines (every 2px, 20% opacity) ← More visible than PRD's 15%
2. RGB Chromatic Aberration (2px offset, not 1px) ← More dramatic
3. Barrel Distortion (3% not 2%) ← More curvature
4. Vignette (dark corners, 40% opacity)
5. Screen Flicker (random brightness ±5% at 60Hz)
6. VHS Tracking Glitch (1% chance per frame, horizontal line shift)
7. Phosphor Persistence (trailing ghost image, 10% opacity, 2 frames)
```

**Dynamic Effects on Events:**

```typescript
// On score event
- Screen flash WHITE (50ms)
- Scanline intensity doubles (100ms)
- Chromatic aberration spikes to 4px (200ms ease-out)

// On achievement
- Screen shake (±3px, 500ms, damped sine wave)
- Rainbow color cycle (full spectrum, 1 second)
- Vignette pulses inward (scale 0.8 → 1.0, 800ms)

// On error (if needed)
- Red flash (100ms)
- Horizontal tear effect (screen splits at random Y)
- Static noise overlay (500ms fade out)
```

### 5. Spatial Layout - Arcade Cabinet Perspective

**3D Cabinet Tilt:**

Instead of flat UI, add subtle perspective like you're looking at a cabinet:

```
        ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲  ← Top bezel (tilted away)
       ║                         ║
      ║                           ║  ← Screen (slight trapezoid)
     ║         GAME AREA           ║
    ║                               ║
   ║                                 ║
  ╱___________________________________╲  ← Control panel (tilted toward)
 │  [COIN]  [START]  [CONTROLS]      │
```

**Implementation:**

```css
.cabinet-screen {
  transform: perspective(1000px) rotateX(-2deg);
  /* Slight tilt back like real cabinet */
}

.control-panel {
  transform: perspective(1000px) rotateX(10deg);
  /* Tilted toward viewer */
}
```

### 6. Gamification - Arcade Authenticity

**High Score System:**

```
┌─────────── HIGH SCORES ───────────┐
│  1ST    ALBERTA_B    98,500  ★★★★★ │
│  2ND    PREV_USER    87,200  ★★★☆☆ │
│  3RD    DEMO_RUN     72,100  ★★★☆☆ │
│  ...                               │
│  NOW    [PLAYING]    12,300  ...   │  ← Current score
└───────────────────────────────────┘
```

**Achievement Badges (Authentic Arcade Style):**

```
╔═══════════════════════╗
║  🏆 ACHIEVEMENT! 🏆   ║
║                       ║
║   ▓▓ VERIFIED ▓▓      ║
║                       ║
║  98% WALDO MATCH      ║
║  +10,000 BONUS        ║
╚═══════════════════════╝
[Appears with fanfare sound]
[Stays on screen 3 seconds]
[Bounces in with elastic easing]
```

**Continue Screen (Easter Egg):**

```
After completion, briefly show:

    VERIFICATION COMPLETE

    CONTINUE?

    [█████████░] 9  ← Countdown from 10
    [█████████░] 8
    ...

[Auto-closes after countdown]
[Pressing any key "continues" = restarts]
```

### 7. Sound Design - Physical Arcade Cabinet

**Beyond 8-bit Synthesis:**

Add **mechanical sounds** for authenticity:

```typescript
soundEffects = {
  // Game sounds (Web Audio synthesis)
  beep: { freq: 800, wave: 'square' },
  laser: { freq: 1200, wave: 'sawtooth' },
  coin: { freq: 1000, wave: 'sine' },

  // ENHANCEMENT: Mechanical sounds (short audio samples)
  coinDrop: 'coin-mechanical.mp3', // Metal clink
  startButton: 'button-press.mp3', // Mechanical click
  cabinetHum: 'cabinet-ambient.mp3', // Background hum (looped)
  screenFlicker: 'crt-static.mp3', // Brief static burst

  // Ambient layer
  arcadeAmbient: [
    'cabinet-hum', // Always playing at 5% volume
    'distant-games', // Faint other arcade games
  ],
};
```

**Spatial Audio:**

```typescript
// Stereo panning for depth
laser.panTo((targetX / canvasWidth) * 2 - 1); // -1 (left) to +1 (right)

// Distance attenuation
const distance = calculateDistance(source, listener);
gainNode.gain.value = 1 / (1 + distance * 0.1);
```

## Animation Enhancements

### Stage Transitions

**Between stages, add "LOADING" interstitial:**

```
[Stage 1 completes]
[Screen fades to black 80%]
[Text appears center:]

    ▓▓▓▓▓▓▓▓▓▓
    ▓ STAGE 2 ▓
    ▓▓▓▓▓▓▓▓▓▓

    BLAKE3 HASH
    GENERATION

    [████████░░] 80%  ← Loading bar fills in 500ms

[Transition to Stage 2]
```

**Screen Shake on Score Events:**

```typescript
function screenShake(intensity: number, duration: number) {
  const startTime = performance.now();

  function shake() {
    const elapsed = performance.now() - startTime;
    if (elapsed > duration) return;

    const decay = 1 - elapsed / duration;
    const angle = elapsed * 0.1; // Oscillation frequency

    const offsetX = Math.sin(angle) * intensity * decay;
    const offsetY = Math.cos(angle * 1.3) * intensity * decay;

    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    requestAnimationFrame(shake);
  }

  shake();
}

// Usage
onScoreEvent((points) => {
  screenShake(3, 500); // 3px intensity, 500ms duration
  flashScreen('#FFFFFF', 50); // White flash, 50ms
});
```

## Technical Implementation Notes

### Canvas Layers

Instead of single canvas, use **layered approach:**

```
┌─ Layer 4: POST-PROCESSING (CRT effects, scanlines)
│  ┌─ Layer 3: UI OVERLAY (score, HUD)
│  │  ┌─ Layer 2: GAME CANVAS (sprites, animations)
│  │  │  ┌─ Layer 1: BACKGROUND (grid, ambient effects)
│  │  │  │
│  │  │  │  [Composite final image]
└──┴──┴──┘
```

**Benefits:**

- CRT effects only on game layer (not UI)
- UI stays crisp while game is distorted
- Background can have independent parallax

### Performance Optimizations

**Object Pooling for Particles:**

```typescript
class ParticlePool {
  private pool: Particle[] = [];
  private active: Particle[] = [];

  get(): Particle {
    return this.pool.pop() || new Particle();
  }

  release(particle: Particle): void {
    particle.reset();
    this.pool.push(particle);
  }
}
```

**Offscreen Canvas for Static Elements:**

```typescript
// Pre-render bezel once
const bezelCanvas = document.createElement('canvas');
const bezelCtx = bezelCanvas.getContext('2d');
renderBezel(bezelCtx); // Draw once

// In game loop, just copy
ctx.drawImage(bezelCanvas, 0, 0); // Fast blit
```

## Easter Eggs & Polish

### Hidden Features

1. **Konami Code:** Type konami code → unlock "GOD MODE" badge
2. **High Score Initials:** If score > 50k, prompt for 3-letter initials
3. **Attract Mode:** If idle 30s, show demo playthrough
4. **Color Cycling:** Press 'C' to cycle color palettes (cyan → green → amber → original)
5. **Debug Menu:** Press '~' for stats overlay (FPS, draw calls, particle count)

### Polish Details

**Pixel-Perfect Alignment:**

```typescript
// Snap all coordinates to integer pixels
function snapToPixel(coord: number): number {
  return Math.round(coord);
}

// Snap all drawing operations
ctx.fillRect(snapToPixel(x), snapToPixel(y), w, h);
```

**Font Loading:**

```typescript
// Ensure fonts loaded before showing
document.fonts.ready.then(() => {
  startGame();
});
```

**Reduced Motion Support:**

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable screen shake, flicker, chromatic aberration
  // Keep core animations but reduce intensity
}
```

## Summary: What Makes This Distinctive

1. **Physical Cabinet Experience** - Not just styled like arcade, feels like you're AT an arcade
2. **Authentic Sound Design** - Mechanical cabinet sounds, not just bleeps
3. **Aggressive Visual Effects** - Really commits to neon/CRT aesthetic
4. **Layered Rendering** - Professional game engine approach
5. **Easter Eggs** - Rewards exploration and repeat plays
6. **Performance-First** - 60 FPS locked, object pooling, optimized rendering

**The Unforgettable Moment:** When the score achievement appears and the screen SHAKES with a satisfying "ka-CHUNK" sound while neon text explodes across the display - you'll know you're not just watching a loader, you're PLAYING the verification.
