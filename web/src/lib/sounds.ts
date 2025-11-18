/**
 * Sound system for review decision feedback
 * PLACEHOLDER: Sound files need to be added to /public/sounds/
 */

let soundEnabled = false; // Default OFF for demos

/**
 * Enable/disable sound system
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

/**
 * Get current sound enabled state
 */
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Play reject sound (Mario death sound placeholder)
 * PLACEHOLDER: Add reject.mp3 to /public/sounds/
 */
export async function playRejectSound(): Promise<boolean> {
  if (!soundEnabled) {
    return false;
  }

  try {
    const audio = new Audio('/sounds/reject.mp3');
    audio.volume = 0.5;
    await audio.play();
    return true;
  } catch (error) {
    console.warn('Reject sound failed to play:', error);
    return false;
  }
}

/**
 * Play approve sound (retro coin/ding)
 * PLACEHOLDER: Add approve.mp3 to /public/sounds/
 */
export async function playApproveSound(): Promise<boolean> {
  if (!soundEnabled) {
    return false;
  }

  try {
    const audio = new Audio('/sounds/approve.mp3');
    audio.volume = 0.3;
    await audio.play();
    return true;
  } catch (error) {
    console.warn('Approve sound failed to play:', error);
    return false;
  }
}
