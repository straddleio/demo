# Paykey Generator V5 - Animation Improvements

## Summary

Fixed hard-coded setTimeout delays and jerky linear animations in the V5 3D Paykey Generator. Replaced with smooth, professional spring-based easing using an animation state machine.

## Changes Made

### 1. Created Animation Utilities (`animationUtils.ts`)

New centralized animation library with:

**Easing Functions:**

- `easeInOutCubic` - Smooth start and end
- `easeOutCubic` - Quick start, slow end
- `easeInCubic` - Slow start, quick end
- `easeOutElastic` - Bouncy spring effect
- `easeOutBack` - Overshoot and settle

**Helper Functions:**

- `lerp()` - Linear interpolation with optional easing
- `spring()` - Physics-based spring interpolation
- `getProgress()` - Time range progress with easing
- `glitchText()` - Controlled text randomization
- `pulse()` - Sinusoidal pulse effect

**Animation State Machine:**

- `AnimationSequence` class - Manages multi-phase animations
- Automatic phase transitions
- Progress tracking (0-1) for each phase
- Completion detection

### 2. Fixed Waldo3D Stage (Identity Matching)

**Timeline: 4 seconds total**

| Phase        | Duration | Animation                                        | Easing                         |
| ------------ | -------- | ------------------------------------------------ | ------------------------------ |
| **Glitch**   | 1.0s     | Text randomization settles to real name          | easeOutCubic                   |
| **Permute**  | 1.5s     | Show name variations (JR, MR, reversed, matched) | Linear with glitch transitions |
| **Score**    | 1.0s     | Similarity score counts up 0→98%                 | easeOutCubic                   |
| **Complete** | 0.5s     | Hold final state                                 | -                              |

**Improvements:**

- Controlled glitch intensity (80% → 0%)
- Smooth name transitions with brief glitches
- Eased score count-up instead of linear
- Connection line fades in with score

### 3. Fixed Blake3D Stage (Merkle Tree Hashing)

**Timeline: 5 seconds total**

| Phase                     | Duration | Animation                                       | Easing                  |
| ------------------------- | -------- | ----------------------------------------------- | ----------------------- |
| **Input Activation**      | 0.2-1.0s | Blocks light up sequentially (0.2s, 0.6s, 1.0s) | easeOutBack (overshoot) |
| **Data Beams**            | 1.5-2.6s | Particles flow to aggregators                   | easeInOutCubic          |
| **Aggregator Activation** | 2.5s     | Layer 1 nodes activate                          | easeOutBack             |
| **Root Beams**            | 3.0-3.9s | Aggregators send to root                        | easeInOutCubic          |
| **Root Activation**       | 4.0s     | Root node glows gold                            | Color lerp over 0.5s    |
| **Complete**              | 5.0s     | Hold final tree state                           | -                       |

**Improvements:**

- Blocks scale in with overshoot (not pop)
- Smooth color transitions (Cyan → Magenta → Gold)
- Data beams have variable scale (shooting effect)
- Gentle continuous pulse on active nodes

**Block Activation:**

```typescript
// Before: Hard-coded times
if (time > 0.5 + index * 0.5) {
  /* activate */
}

// After: Smooth scale-in
const scaleProgress = Math.min(1, timeSinceActive / 0.3);
const targetScale = lerp(0.1, 1.0, scaleProgress, easing.easeOutBack);
const pulseEffect = pulse(elapsed - activateTime, 2, 0.05, 1);
ref.current.scale.setScalar(targetScale * pulseEffect);
```

**Data Beam Animation:**

```typescript
// Before: Linear movement
const progress = (time - delay) * 2;

// After: Eased with dynamic scale
const easedProgress = easing.easeInOutCubic(beamProgress);
const scale =
  beamProgress < 0.5 ? lerp(0.1, 0.2, beamProgress * 2) : lerp(0.2, 0.05, (beamProgress - 0.5) * 2);
```

### 4. Fixed Minting3D Stage (Token Generation)

**Timeline: 4 seconds total**

| Phase           | Duration | Animation                                              | Easing                                       |
| --------------- | -------- | ------------------------------------------------------ | -------------------------------------------- |
| **Materialize** | 1.0s     | Coin appears from nothing, spins up                    | easeOutBack (scale), easeOutCubic (rotation) |
| **Forge**       | 1.5s     | Rotation slows, ring glow intensifies                  | easeInOutCubic (glow)                        |
| **Stamp**       | 1.0s     | Coin flattens slightly (minting pressure), ring pulses | Sinusoidal (flatten + pulse)                 |
| **Reveal**      | 0.5s     | Return to normal, slow final rotation                  | Linear lerp                                  |

**Improvements:**

- Coin materializes with overshoot bounce
- Rotation decelerates smoothly (0.2 → 0.05 → 0.02 → 0.01)
- Ring glow transitions 2 → 4 → pulsing → 2
- "Stamp" effect with Y-axis squash (10% max)
- All transitions use easing curves

**Minting Ceremony:**

```typescript
// Before: Simple spin with linear slowdown
coinRef.current.rotation.y += 0.1 - Math.max(0, elapsed - 2) * 0.05;

// After: Phase-based rotation with easing
case 'materialize':
  const rotationSpeed = lerp(0.2, 0.05, progress, easing.easeOutCubic);
  coinRef.current.rotation.y += rotationSpeed;
  break;

case 'stamp':
  const flatten = 1 - Math.sin(progress * Math.PI) * 0.1;
  coinRef.current.scale.set(1, flatten, 1);
  break;
```

## Total Experience Timeline

```
0s ━━━━━━━━━━━━━━ 4s: WALDO (Identity Matching)
4s ━━━━━━━━━━━━━━━━━━━━ 9s: BLAKE3 (Hashing)
9s ━━━━━━━━━━━━━━ 13s: MINTING (Token Generation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 13 seconds
```

## Technical Improvements

### Before

- ❌ Hard-coded `setTimeout()` everywhere
- ❌ Linear animations (no easing)
- ❌ Random timing (6s? 3.5s?)
- ❌ No animation state management
- ❌ Jerky scale/color changes
- ❌ Text glitch too aggressive

### After

- ✅ Animation state machine with phases
- ✅ Professional easing curves
- ✅ Coherent timing flow
- ✅ Smooth transitions with anticipation
- ✅ Controlled glitch intensity
- ✅ Physics-inspired effects (overshoot, spring)

## Files Modified

1. **`web/src/components/generator/v5/animationUtils.ts`** (NEW)
   - Easing functions library
   - Animation state machine
   - Helper utilities

2. **`web/src/components/generator/v5/stages/Waldo3D.tsx`**
   - Replaced async/await setTimeout with AnimationSequence
   - Added easing to glitch, name transitions, score
   - Controlled glitch intensity decay

3. **`web/src/components/generator/v5/stages/Blake3D.tsx`**
   - Updated Block activation timing (0.5s → 0.2s intervals)
   - Added easeOutBack for block scale-in
   - Smooth color transitions with lerp
   - Data beams use easing and dynamic scale
   - Added startTimeRef for consistent timing

4. **`web/src/components/generator/v5/stages/Minting3D.tsx`**
   - Complete minting ceremony animation
   - Phase-based rotation deceleration
   - Stamp effect with Y-axis squash
   - Ring glow transitions with easing
   - Removed Date.now() in favor of state.clock.elapsedTime

## Animation Patterns

### 1. State Machine Pattern

```typescript
const animSeq = useRef(
  new AnimationSequence([
    { name: 'phase1', duration: 1.0 },
    { name: 'phase2', duration: 1.5 },
  ])
);

animSeq.current.start(time);
const state = animSeq.current.update(time);

switch (state.phase) {
  case 'phase1':
    /* animate */ break;
  case 'phase2':
    /* animate */ break;
}
```

### 2. Smooth Transitions

```typescript
// Scale with overshoot
const scale = lerp(0, 1, progress, easing.easeOutBack);

// Color transition
const r = lerp(0, 1, progress);
const g = lerp(1, 0.84, progress);
mesh.color.setRGB(r, g, b);
```

### 3. Time Synchronization

```typescript
// Initialize once
if (startTimeRef.current === null) {
  startTimeRef.current = state.clock.elapsedTime;
}

// Use elapsed time
const elapsed = state.clock.elapsedTime - startTimeRef.current;
```

## Testing

Run the generator:

1. Start server: `npm run dev`
2. Open http://localhost:5173
3. Type `/demo` in terminal
4. Watch all three stages complete smoothly

Expected behavior:

- Waldo: Name glitches settle, variants cycle, score counts up
- Blake3: Blocks pop in with bounce, beams shoot smoothly, colors transition
- Minting: Coin materializes, forges, stamps, reveals

## Performance Notes

- All animations use `useFrame` (60 FPS)
- No setTimeout/setInterval blocking main thread
- Glitch updates throttled to 20 FPS (50ms intervals)
- Easing functions are pure math (no allocations)
- AnimationSequence reuses single instance

## Future Improvements

1. **Sound effects** - Add whoosh/ping sounds to phase transitions
2. **Particle systems** - Add sparks during Blake3 hashing
3. **Camera movement** - Subtle camera shifts between stages
4. **Shader effects** - CRT scanlines, chromatic aberration
5. **User control** - Skip/pause/replay buttons

---

Generated: 2025-11-19
Author: Claude (Sonnet 4.5)
