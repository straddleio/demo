/**
 * Animation utilities for review decision system
 * Supports easy commenting out of specific effects
 */

/**
 * Screen shake effect
 * TOGGLE: Comment out the entire function body to disable screen shake
 */
export function triggerScreenShake(element: HTMLElement = document.body): void {
  // TOGGLE: Comment out this line to disable screen shake animation
  element.classList.add('animate-shake');
  setTimeout(() => {
    element.classList.remove('animate-shake');
  }, 500);
}

/**
 * Full reject animation sequence
 * Returns cleanup function
 */
export function triggerRejectAnimation(): () => void {
  const overlay = document.createElement('div');
  overlay.id = 'reject-overlay';
  overlay.className = 'fixed inset-0 pointer-events-none z-50';
  document.body.appendChild(overlay);

  // TOGGLE: Comment out this block to disable red flash effect
  overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
  overlay.style.animation = 'reject-flash 1s ease-out';

  // TOGGLE: Comment out this block to disable screen shake on reject
  triggerScreenShake();

  // TOGGLE: Comment out this block to disable REJECTED text overlay
  const text = document.createElement('div');
  text.className = 'absolute inset-0 flex items-center justify-center';
  text.innerHTML = `
    <div class="text-center">
      <div class="text-6xl font-pixel text-accent drop-shadow-[0_0_10px_rgba(255,0,99,0.8)] animate-pulse">
        REJECTED
      </div>
    </div>
  `;
  overlay.appendChild(text);

  // Cleanup after 1.5s
  const cleanup = (): void => {
    overlay.remove();
  };

  setTimeout(cleanup, 1500);

  return cleanup;
}

/**
 * Approve animation sequence
 * Returns cleanup function
 */
export function triggerApproveAnimation(): () => void {
  const overlay = document.createElement('div');
  overlay.id = 'approve-overlay';
  overlay.className = 'fixed inset-0 pointer-events-none z-50';
  document.body.appendChild(overlay);

  // TOGGLE: Comment out this block to disable green glow effect
  overlay.style.background = 'radial-gradient(circle, rgba(0,255,0,0.1) 0%, transparent 70%)';
  overlay.style.animation = 'approve-glow 1s ease-out';

  // TOGGLE: Comment out this block to disable checkmark animation
  const checkmark = document.createElement('div');
  checkmark.className = 'absolute inset-0 flex items-center justify-center';
  checkmark.innerHTML = `
    <div class="text-8xl text-green-500 animate-bounce">✓</div>
  `;
  overlay.appendChild(checkmark);

  // TOGGLE: Comment out this line to disable coin sparkles
  createCoinSparkles(overlay);

  // Cleanup after 1s
  const cleanup = (): void => {
    overlay.remove();
  };

  setTimeout(cleanup, 1000);

  return cleanup;
}

/**
 * Create retro coin collect sparkles
 * TOGGLE: Comment out the entire function body to disable sparkles
 */
function createCoinSparkles(container: HTMLElement): void {
  // TOGGLE: Comment out this entire for loop to disable all sparkles
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'absolute w-2 h-2 bg-gold rounded-full animate-sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 0.5}s`;
    container.appendChild(sparkle);
  }
}
