/**
 * Animation utilities for smooth, professional animations in the V5 Paykey Generator
 * Uses easing functions and state machines instead of hard-coded timeouts
 */

/**
 * Smooth easing functions
 */
export const easing = {
  // Smooth start and end
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  // Quick start, slow end
  easeOutCubic: (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  },

  // Slow start, quick end
  easeInCubic: (t: number): number => {
    return t * t * t;
  },

  // Bouncy spring effect
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  // Overshoot and settle
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/**
 * Linear interpolation with optional easing
 */
export function lerp(
  start: number,
  end: number,
  t: number,
  easingFn?: (t: number) => number
): number {
  const clampedT = Math.max(0, Math.min(1, t));
  const easedT = easingFn ? easingFn(clampedT) : clampedT;
  return start + (end - start) * easedT;
}

/**
 * Smooth spring physics interpolation
 * More natural than easing curves for continuous motion
 */
export function spring(
  current: number,
  target: number,
  velocity: number,
  stiffness = 0.1,
  damping = 0.8
): { value: number; velocity: number } {
  const delta = target - current;
  const springForce = delta * stiffness;
  const dampingForce = velocity * damping;
  const newVelocity = velocity + springForce - dampingForce;
  const newValue = current + newVelocity;

  return { value: newValue, velocity: newVelocity };
}

/**
 * Get progress (0-1) for a time range with optional easing
 */
export function getProgress(
  currentTime: number,
  startTime: number,
  duration: number,
  easingFn?: (t: number) => number
): number {
  const rawProgress = (currentTime - startTime) / duration;
  const clampedProgress = Math.max(0, Math.min(1, rawProgress));
  return easingFn ? easingFn(clampedProgress) : clampedProgress;
}

/**
 * Check if time is within a range
 */
export function isInTimeRange(currentTime: number, start: number, end: number): boolean {
  return currentTime >= start && currentTime <= end;
}

/**
 * Animation state machine for managing complex sequences
 */
export interface AnimationState {
  phase: string;
  startTime: number;
  duration: number;
  progress: number;
  isComplete: boolean;
}

export class AnimationSequence {
  private phases: Map<string, { duration: number; index: number }> = new Map();
  private currentPhaseIndex = 0;
  private startTime = 0;

  constructor(phases: Array<{ name: string; duration: number }>) {
    phases.forEach((phase, index) => {
      this.phases.set(phase.name, { duration: phase.duration, index });
    });
  }

  start(currentTime: number): void {
    this.startTime = currentTime;
    this.currentPhaseIndex = 0;
  }

  update(currentTime: number): AnimationState | null {
    if (this.currentPhaseIndex >= this.phases.size) {
      return null; // Sequence complete
    }

    const phaseArray = Array.from(this.phases.entries());
    const [phaseName, phaseData] = phaseArray[this.currentPhaseIndex];

    const elapsed = currentTime - this.startTime;
    const progress = Math.min(1, elapsed / phaseData.duration);

    if (progress >= 1) {
      // Move to next phase
      this.currentPhaseIndex++;
      this.startTime = currentTime;

      if (this.currentPhaseIndex >= this.phases.size) {
        return {
          phase: phaseName,
          startTime: this.startTime,
          duration: phaseData.duration,
          progress: 1,
          isComplete: true,
        };
      }

      const [nextPhaseName, nextPhaseData] = phaseArray[this.currentPhaseIndex];
      return {
        phase: nextPhaseName,
        startTime: this.startTime,
        duration: nextPhaseData.duration,
        progress: 0,
        isComplete: false,
      };
    }

    return {
      phase: phaseName,
      startTime: this.startTime,
      duration: phaseData.duration,
      progress,
      isComplete: false,
    };
  }

  getCurrentPhase(): string | null {
    const phaseArray = Array.from(this.phases.entries());
    if (this.currentPhaseIndex >= phaseArray.length) {
      return null;
    }
    return phaseArray[this.currentPhaseIndex][0];
  }
}

/**
 * Glitch text with controlled intensity
 */
export function glitchText(text: string, intensity: number): string {
  return text
    .split('')
    .map((char) => {
      if (Math.random() > intensity) {
        return char;
      }
      return String.fromCharCode(65 + Math.floor(Math.random() * 26));
    })
    .join('');
}

/**
 * Pulse effect (sinusoidal)
 */
export function pulse(time: number, frequency = 2, amplitude = 0.1, offset = 1): number {
  return Math.sin(time * frequency) * amplitude + offset;
}
