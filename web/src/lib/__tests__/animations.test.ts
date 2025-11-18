import { triggerScreenShake, triggerRejectAnimation, triggerApproveAnimation } from '../animations';

describe('Animation System', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('triggerScreenShake', () => {
    it('should add and remove shake class', async () => {
      const root = document.getElementById('root')!;

      triggerScreenShake(root);

      expect(root.classList.contains('animate-shake')).toBe(true);

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(root.classList.contains('animate-shake')).toBe(false);
    });
  });

  describe('triggerRejectAnimation', () => {
    it('should return cleanup function', () => {
      const cleanup = triggerRejectAnimation();

      expect(typeof cleanup).toBe('function');

      // Should not throw
      cleanup();
    });
  });

  describe('triggerApproveAnimation', () => {
    it('should return cleanup function', () => {
      const cleanup = triggerApproveAnimation();

      expect(typeof cleanup).toBe('function');

      // Should not throw
      cleanup();
    });
  });
});
