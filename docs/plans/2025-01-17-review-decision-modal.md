# Review Decision Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a "Compliance Challenge" modal for approving/rejecting customers and paykeys in review status, with MK-style reject animations and retro arcade approve animations.

**Architecture:** Shared React modal component with animation system, backend decision endpoints (already exist), state updates via SSE, terminal/logs integration.

**Tech Stack:** React, TypeScript, Tailwind CSS, Zustand (state), Straddle SDK, Express, Jest/Vitest

---

## Task 1: Backend - Verify Review Decision Endpoints

**Files:**

- Test: `server/src/routes/__tests__/customers.test.ts`
- Test: `server/src/routes/__tests__/paykeys.test.ts`
- Review: `server/src/routes/customers.ts:492-580`
- Review: `server/src/routes/paykeys.ts:304-401`

**Step 1: Write tests for customer review decision endpoint**

Add to `server/src/routes/__tests__/customers.test.ts`:

```typescript
describe('PATCH /api/customers/:id/review', () => {
  it('should approve customer in review', async () => {
    // Mock SDK response
    mockStraddleClient.customers.review.decision = jest.fn().mockResolvedValue({
      data: {
        id: 'cust_123',
        status: 'verified',
      },
    });

    const response = await request(app)
      .patch('/api/customers/cust_123/review')
      .send({ status: 'verified' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('verified');
    expect(mockStraddleClient.customers.review.decision).toHaveBeenCalledWith('cust_123', {
      status: 'verified',
    });
  });

  it('should reject customer in review', async () => {
    mockStraddleClient.customers.review.decision = jest.fn().mockResolvedValue({
      data: {
        id: 'cust_123',
        status: 'rejected',
      },
    });

    const response = await request(app)
      .patch('/api/customers/cust_123/review')
      .send({ status: 'rejected' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('rejected');
  });

  it('should return 400 for invalid status', async () => {
    const response = await request(app)
      .patch('/api/customers/cust_123/review')
      .send({ status: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
```

**Step 2: Run customer tests**

```bash
npm test --workspace=server -- customers.test.ts
```

Expected: Tests should PASS (endpoint already exists)

**Step 3: Write tests for paykey review decision endpoint**

Add to `server/src/routes/__tests__/paykeys.test.ts`:

```typescript
describe('PATCH /api/paykeys/:id/review', () => {
  it('should approve paykey in review', async () => {
    mockStraddleClient.paykeys.review.decision = jest.fn().mockResolvedValue({
      data: {
        id: 'paykey_123',
        status: 'active',
      },
    });

    const response = await request(app)
      .patch('/api/paykeys/paykey_123/review')
      .send({ decision: 'approved' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('active');
    expect(mockStraddleClient.paykeys.review.decision).toHaveBeenCalledWith('paykey_123', {
      status: 'active',
    });
  });

  it('should reject paykey in review', async () => {
    mockStraddleClient.paykeys.review.decision = jest.fn().mockResolvedValue({
      data: {
        id: 'paykey_123',
        status: 'rejected',
      },
    });

    const response = await request(app)
      .patch('/api/paykeys/paykey_123/review')
      .send({ decision: 'rejected' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('rejected');
  });

  it('should return 400 for invalid decision', async () => {
    const response = await request(app)
      .patch('/api/paykeys/paykey_123/review')
      .send({ decision: 'maybe' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('approved');
  });
});
```

**Step 4: Run paykey tests**

```bash
npm test --workspace=server -- paykeys.test.ts
```

Expected: Tests should PASS (endpoint already exists)

**Step 5: Commit backend verification**

```bash
git add server/src/routes/__tests__/
git commit -m "test: verify review decision endpoints exist"
```

---

## Task 2: Frontend - Review Decision API Client

**Files:**

- Modify: `web/src/lib/api.ts`
- Test: `web/src/lib/__tests__/api.test.ts`

**Step 1: Write failing test for customer review decision**

Add to `web/src/lib/__tests__/api.test.ts`:

```typescript
describe('customerReviewDecision', () => {
  it('should approve customer', async () => {
    const mockResponse = { id: 'cust_123', status: 'verified' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await customerReviewDecision('cust_123', 'verified');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/customers/cust_123/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'verified' }),
    });
  });

  it('should reject customer', async () => {
    const mockResponse = { id: 'cust_123', status: 'rejected' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await customerReviewDecision('cust_123', 'rejected');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/customers/cust_123/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    });
  });

  it('should throw on API error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid status' }),
    });

    await expect(customerReviewDecision('cust_123', 'verified')).rejects.toThrow();
  });
});

describe('paykeyReviewDecision', () => {
  it('should approve paykey', async () => {
    const mockResponse = { id: 'paykey_123', status: 'active' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await paykeyReviewDecision('paykey_123', 'approved');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/paykeys/paykey_123/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'approved' }),
    });
  });

  it('should reject paykey', async () => {
    const mockResponse = { id: 'paykey_123', status: 'rejected' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await paykeyReviewDecision('paykey_123', 'rejected');

    expect(result).toEqual(mockResponse);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --workspace=web -- api.test.ts
```

Expected: FAIL with "customerReviewDecision is not defined"

**Step 3: Implement API client functions**

Add to `web/src/lib/api.ts`:

```typescript
const API_BASE = 'http://localhost:3001/api';

/**
 * Make a customer review decision (approve/reject)
 */
export async function customerReviewDecision(
  customerId: string,
  status: 'verified' | 'rejected'
): Promise<unknown> {
  const response = await fetch(`${API_BASE}/customers/${customerId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update customer review');
  }

  return response.json();
}

/**
 * Make a paykey review decision (approve/reject)
 */
export async function paykeyReviewDecision(
  paykeyId: string,
  decision: 'approved' | 'rejected'
): Promise<unknown> {
  const response = await fetch(`${API_BASE}/paykeys/${paykeyId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update paykey review');
  }

  return response.json();
}
```

**Step 4: Run test to verify it passes**

```bash
npm test --workspace=web -- api.test.ts
```

Expected: PASS

**Step 5: Commit API client**

```bash
git add web/src/lib/api.ts web/src/lib/__tests__/api.test.ts
git commit -m "feat: add review decision API client functions"
```

---

## Task 3: Animation System - Shared Utilities

**Files:**

- Create: `web/src/lib/animations.ts`
- Test: `web/src/lib/__tests__/animations.test.ts`

**Step 1: Write failing test for animation triggers**

Create `web/src/lib/__tests__/animations.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

```bash
npm test --workspace=web -- animations.test.ts
```

Expected: FAIL with "Cannot find module '../animations'"

**Step 3: Implement animation utilities**

Create `web/src/lib/animations.ts`:

```typescript
/**
 * Animation utilities for review decision system
 * Supports easy commenting out of specific effects
 */

/**
 * Screen shake effect
 */
export function triggerScreenShake(element: HTMLElement = document.body): void {
  // TOGGLE: Comment out to disable screen shake
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

  // TOGGLE: Comment out to disable red flash
  overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
  overlay.style.animation = 'reject-flash 1s ease-out';

  // TOGGLE: Comment out to disable screen shake
  triggerScreenShake();

  // TOGGLE: Comment out to disable text overlay
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
  const cleanup = () => {
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

  // TOGGLE: Comment out to disable green glow
  overlay.style.background = 'radial-gradient(circle, rgba(0,255,0,0.1) 0%, transparent 70%)';
  overlay.style.animation = 'approve-glow 1s ease-out';

  // TOGGLE: Comment out to disable checkmark
  const checkmark = document.createElement('div');
  checkmark.className = 'absolute inset-0 flex items-center justify-center';
  checkmark.innerHTML = `
    <div class="text-8xl text-green-500 animate-bounce">✓</div>
  `;
  overlay.appendChild(checkmark);

  // TOGGLE: Comment out to disable coin sparkles
  createCoinSparkles(overlay);

  // Cleanup after 1s
  const cleanup = () => {
    overlay.remove();
  };

  setTimeout(cleanup, 1000);

  return cleanup;
}

/**
 * Create retro coin collect sparkles
 */
function createCoinSparkles(container: HTMLElement): void {
  // TOGGLE: Comment out this entire function to disable sparkles
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'absolute w-2 h-2 bg-gold rounded-full animate-sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 0.5}s`;
    container.appendChild(sparkle);
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test --workspace=web -- animations.test.ts
```

Expected: PASS

**Step 5: Add Tailwind animation classes**

Modify `web/tailwind.config.js` to add animations:

```javascript
// In theme.extend.keyframes:
'shake': {
  '0%, 100%': { transform: 'translateX(0)' },
  '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
  '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
},
'reject-flash': {
  '0%': { opacity: '0.5' },
  '50%': { opacity: '0.8' },
  '100%': { opacity: '0' },
},
'approve-glow': {
  '0%': { opacity: '0.3' },
  '50%': { opacity: '0.5' },
  '100%': { opacity: '0' },
},
'sparkle': {
  '0%': { opacity: '0', transform: 'scale(0)' },
  '50%': { opacity: '1', transform: 'scale(1)' },
  '100%': { opacity: '0', transform: 'translateY(-50px) scale(0)' },
},

// In theme.extend.animation:
'shake': 'shake 0.5s ease-in-out',
'sparkle': 'sparkle 1s ease-out forwards',
```

**Step 6: Commit animation system**

```bash
git add web/src/lib/animations.ts web/src/lib/__tests__/animations.test.ts web/tailwind.config.js
git commit -m "feat: add animation system for review decisions"
```

---

## Task 4: Sound System - Placeholder Infrastructure

**Files:**

- Create: `web/src/lib/sounds.ts`
- Create: `web/public/sounds/.gitkeep`
- Test: `web/src/lib/__tests__/sounds.test.ts`

**Step 1: Write failing test for sound system**

Create `web/src/lib/__tests__/sounds.test.ts`:

```typescript
import { playRejectSound, playApproveSound, setSoundEnabled } from '../sounds';

describe('Sound System', () => {
  beforeEach(() => {
    // Mock Audio API
    global.Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      volume: 1,
    })) as unknown as typeof Audio;
  });

  it('should play reject sound when enabled', async () => {
    setSoundEnabled(true);

    const result = await playRejectSound();

    expect(result).toBe(true);
  });

  it('should not play reject sound when disabled', async () => {
    setSoundEnabled(false);

    const result = await playRejectSound();

    expect(result).toBe(false);
  });

  it('should play approve sound when enabled', async () => {
    setSoundEnabled(true);

    const result = await playApproveSound();

    expect(result).toBe(true);
  });

  it('should handle missing sound files gracefully', async () => {
    setSoundEnabled(true);

    // Mock play failure
    global.Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn().mockRejectedValue(new Error('Sound file not found')),
    })) as unknown as typeof Audio;

    const result = await playRejectSound();

    // Should not throw, returns false
    expect(result).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --workspace=web -- sounds.test.ts
```

Expected: FAIL with "Cannot find module '../sounds'"

**Step 3: Implement sound system**

Create `web/src/lib/sounds.ts`:

```typescript
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
 * PLACEHOLDER: Add mario-death.mp3 to /public/sounds/
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
 * PLACEHOLDER: Add coin-ding.mp3 to /public/sounds/
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
```

**Step 4: Run test to verify it passes**

```bash
npm test --workspace=web -- sounds.test.ts
```

Expected: PASS

**Step 5: Create sounds directory**

```bash
mkdir -p web/public/sounds
touch web/public/sounds/.gitkeep
```

**Step 6: Commit sound system**

```bash
git add web/src/lib/sounds.ts web/src/lib/__tests__/sounds.test.ts web/public/sounds/.gitkeep
git commit -m "feat: add sound system with placeholders for audio files"
```

---

## Task 5: Review Decision Modal Component

**Files:**

- Create: `web/src/components/ReviewDecisionModal.tsx`
- Test: `web/src/components/__tests__/ReviewDecisionModal.test.tsx`

**Step 1: Write failing test for modal**

Create `web/src/components/__tests__/ReviewDecisionModal.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewDecisionModal } from '../ReviewDecisionModal';
import * as animations from '@/lib/animations';
import * as sounds from '@/lib/sounds';

jest.mock('@/lib/animations');
jest.mock('@/lib/sounds');
jest.mock('@/lib/api');

describe('ReviewDecisionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnDecision = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Customer Review', () => {
    const customerData = {
      type: 'customer' as const,
      id: 'cust_123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+12125550123',
      status: 'review',
      verificationSummary: {
        email: 'accept',
        phone: 'accept',
        fraud: 'review',
      },
    };

    it('should render customer modal', () => {
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should call onDecision with approved on APPROVE click', async () => {
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      fireEvent.click(screen.getByText('APPROVE'));

      await waitFor(() => {
        expect(mockOnDecision).toHaveBeenCalledWith('verified');
      });
    });

    it('should call onDecision with rejected on REJECT click', async () => {
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      fireEvent.click(screen.getByText('REJECT'));

      await waitFor(() => {
        expect(mockOnDecision).toHaveBeenCalledWith('rejected');
      });
    });

    it('should trigger approve animation on APPROVE', async () => {
      const mockCleanup = jest.fn();
      (animations.triggerApproveAnimation as jest.Mock).mockReturnValue(mockCleanup);

      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      fireEvent.click(screen.getByText('APPROVE'));

      await waitFor(() => {
        expect(animations.triggerApproveAnimation).toHaveBeenCalled();
      });
    });

    it('should trigger reject animation on REJECT', async () => {
      const mockCleanup = jest.fn();
      (animations.triggerRejectAnimation as jest.Mock).mockReturnValue(mockCleanup);

      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      fireEvent.click(screen.getByText('REJECT'));

      await waitFor(() => {
        expect(animations.triggerRejectAnimation).toHaveBeenCalled();
      });
    });
  });

  describe('Paykey Review', () => {
    const paykeyData = {
      type: 'paykey' as const,
      id: 'paykey_123',
      customerName: 'John Doe',
      institution: 'Chase Bank',
      balance: 1000.0,
      status: 'review',
      verificationSummary: {
        nameMatch: 'accept',
        accountValidation: 'review',
      },
    };

    it('should render paykey modal', () => {
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={paykeyData}
        />
      );

      expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      expect(screen.getByText('Chase Bank')).toBeInTheDocument();
      expect(screen.getByText(/\$1,000.00/)).toBeInTheDocument();
    });

    it('should call onDecision with active on APPROVE', async () => {
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={paykeyData}
        />
      );

      fireEvent.click(screen.getByText('APPROVE'));

      await waitFor(() => {
        expect(mockOnDecision).toHaveBeenCalledWith('approved');
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should not render when isOpen is false', () => {
      const customerData = {
        type: 'customer' as const,
        id: 'cust_123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+12125550123',
        status: 'review',
      };

      render(
        <ReviewDecisionModal
          isOpen={false}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      expect(screen.queryByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).not.toBeInTheDocument();
    });

    it('should close modal on backdrop click', () => {
      const customerData = {
        type: 'customer' as const,
        id: 'cust_123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+12125550123',
        status: 'review',
      };

      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      // Click backdrop (the overlay div)
      const backdrop = screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️').parentElement?.parentElement?.parentElement;
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --workspace=web -- ReviewDecisionModal.test.tsx
```

Expected: FAIL with "Cannot find module '../ReviewDecisionModal'"

**Step 3: Implement modal component**

Create `web/src/components/ReviewDecisionModal.tsx`:

```typescript
import React, { useState } from 'react';
import { cn } from './ui/utils';
import { triggerApproveAnimation, triggerRejectAnimation } from '@/lib/animations';
import { playApproveSound, playRejectSound } from '@/lib/sounds';

type CustomerReviewData = {
  type: 'customer';
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  verificationSummary?: Record<string, string>;
};

type PaykeyReviewData = {
  type: 'paykey';
  id: string;
  customerName: string;
  institution: string;
  balance: number;
  status: string;
  verificationSummary?: Record<string, string>;
};

type ReviewData = CustomerReviewData | PaykeyReviewData;

interface ReviewDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecision: (decision: 'verified' | 'rejected' | 'approved') => Promise<void>;
  data: ReviewData;
}

export const ReviewDecisionModal: React.FC<ReviewDecisionModalProps> = ({
  isOpen,
  onClose,
  onDecision,
  data,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleApprove = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    // Trigger animation and sound
    const cleanup = triggerApproveAnimation();
    void playApproveSound();

    // Call decision handler
    const decision = data.type === 'customer' ? 'verified' : 'approved';
    await onDecision(decision);

    // Close modal after animation
    setTimeout(() => {
      cleanup();
      onClose();
      setIsProcessing(false);
    }, 1000);
  };

  const handleReject = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    // Trigger animation and sound
    const cleanup = triggerRejectAnimation();
    void playRejectSound();

    // Call decision handler
    await onDecision('rejected');

    // Close modal after animation
    setTimeout(() => {
      cleanup();
      onClose();
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg mx-4">
        {/* Modal Card */}
        <div className="border-4 border-primary bg-background rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)]">
          {/* Header */}
          <div className="border-b-4 border-primary bg-primary/10 px-6 py-4">
            <h2 className="text-2xl font-pixel text-primary text-center">
              ⚔️ COMPLIANCE CHALLENGE ⚔️
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {data.type === 'customer' ? (
              <>
                <div className="text-center mb-4">
                  <p className="text-xl font-body text-neutral-100">{data.name}</p>
                  <p className="text-sm text-neutral-400">{data.email}</p>
                  <p className="text-sm text-neutral-400">{data.phone}</p>
                </div>

                {data.verificationSummary && (
                  <div className="border border-primary/20 rounded-pixel bg-background-dark/50 p-4">
                    <p className="text-xs text-neutral-400 font-body mb-2">Verification Summary</p>
                    <div className="space-y-1">
                      {Object.entries(data.verificationSummary).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-neutral-300 capitalize">{key}:</span>
                          <span
                            className={cn(
                              'font-pixel',
                              value === 'accept'
                                ? 'text-green-500'
                                : value === 'review'
                                  ? 'text-gold'
                                  : 'text-accent'
                            )}
                          >
                            {value.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-xl font-body text-neutral-100">{data.institution}</p>
                  <p className="text-sm text-neutral-400">{data.customerName}</p>
                  <p className="text-lg text-primary font-bold mt-2">
                    ${data.balance.toFixed(2)}
                  </p>
                </div>

                {data.verificationSummary && (
                  <div className="border border-primary/20 rounded-pixel bg-background-dark/50 p-4">
                    <p className="text-xs text-neutral-400 font-body mb-2">Verification Summary</p>
                    <div className="space-y-1">
                      {Object.entries(data.verificationSummary).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-neutral-300 capitalize">{key}:</span>
                          <span
                            className={cn(
                              'font-pixel',
                              value === 'accept'
                                ? 'text-green-500'
                                : value === 'review'
                                  ? 'text-gold'
                                  : 'text-accent'
                            )}
                          >
                            {value.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-4 border-t border-primary/20">
              <p className="text-center text-sm text-neutral-400 font-body mb-4">
                RENDER YOUR VERDICT
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className={cn(
                    'flex-1 px-6 py-3 font-pixel text-lg',
                    'border-2 border-green-500 bg-green-500/10 text-green-500',
                    'hover:bg-green-500/20 hover:border-green-400',
                    'rounded-pixel transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  APPROVE
                </button>

                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className={cn(
                    'flex-1 px-6 py-3 font-pixel text-lg',
                    'border-2 border-accent bg-accent/10 text-accent',
                    'hover:bg-accent/20 hover:border-accent',
                    'rounded-pixel transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  REJECT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

**Step 4: Run test to verify it passes**

```bash
npm test --workspace=web -- ReviewDecisionModal.test.tsx
```

Expected: PASS

**Step 5: Commit modal component**

```bash
git add web/src/components/ReviewDecisionModal.tsx web/src/components/__tests__/ReviewDecisionModal.test.tsx
git commit -m "feat: add ReviewDecisionModal component with animations"
```

---

## Task 6: Integrate Modal with CustomerCard

**Files:**

- Modify: `web/src/components/dashboard/CustomerCard.tsx:292-305`
- Test: `web/src/components/dashboard/__tests__/CustomerCard.test.tsx`

**Step 1: Write failing test for modal integration**

Add to `web/src/components/dashboard/__tests__/CustomerCard.test.tsx`:

```typescript
import { fireEvent, waitFor } from '@testing-library/react';

describe('CustomerCard - Review Modal Integration', () => {
  it('should open modal when review button clicked', () => {
    const customer = {
      id: 'cust_123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+12125550123',
      verification_status: 'review',
      type: 'individual' as const,
      created_at: '2025-01-01T00:00:00Z',
    };

    const { getByText, queryByText } = render(
      <CustomerCard />,
      {
        initialState: { customer },
      }
    );

    // Modal should not be visible initially
    expect(queryByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).not.toBeInTheDocument();

    // Click review button
    fireEvent.click(getByText('REVIEW'));

    // Modal should appear
    expect(getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
  });

  it('should call API and update state on approve', async () => {
    const customer = {
      id: 'cust_123',
      name: 'John Doe',
      email: 'john@example.com',
      verification_status: 'review',
      type: 'individual' as const,
      created_at: '2025-01-01T00:00:00Z',
    };

    // Mock API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'cust_123', status: 'verified' }),
    });

    const { getByText } = render(
      <CustomerCard />,
      {
        initialState: { customer },
      }
    );

    // Open modal
    fireEvent.click(getByText('REVIEW'));

    // Click approve
    fireEvent.click(getByText('APPROVE'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/customers/cust_123/review',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'verified' }),
        })
      );
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --workspace=web -- CustomerCard.test.tsx
```

Expected: FAIL (modal not implemented in CustomerCard yet)

**Step 3: Integrate modal into CustomerCard**

Modify `web/src/components/dashboard/CustomerCard.tsx`:

```typescript
// Add imports at top
import { ReviewDecisionModal } from '@/components/ReviewDecisionModal';
import { customerReviewDecision } from '@/lib/api';
import { useDemoStore } from '@/lib/state';

// Add state for modal
const [isModalOpen, setIsModalOpen] = useState(false);

// Replace review button onClick handler (lines 292-305)
<button
  onClick={() => setIsModalOpen(true)}
  className={cn(
    'px-2 py-1 text-xs font-pixel uppercase transition-all',
    'bg-gold/20 text-gold border border-gold/40 rounded-pixel',
    'hover:bg-gold/30 hover:border-gold/60',
    'animate-pulse',
    'cursor-pointer'
  )}
>
  {status.toUpperCase()}
</button>

// Add modal before closing </RetroCard> tag
{customer.verification_status === 'review' && (
  <ReviewDecisionModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onDecision={async (decision) => {
      // Log to terminal
      const logId = useDemoStore.getState().addAPILogEntry({
        type: 'ui-action',
        text: `Customer review decision: ${decision}`,
      });

      try {
        // Call API
        await customerReviewDecision(customer.id, decision as 'verified' | 'rejected');

        // State will update via SSE
      } catch (error) {
        console.error('Failed to update customer review:', error);
        // Show error in terminal
        useDemoStore.getState().addTerminalLine({
          text: `Error: ${error instanceof Error ? error.message : 'Failed to update review'}`,
          type: 'error',
        });
      }
    }}
    data={{
      type: 'customer',
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.verification_status || 'review',
      verificationSummary: modules.reduce((acc, m) => {
        acc[m.name.toLowerCase()] = m.decision;
        return acc;
      }, {} as Record<string, string>),
    }}
  />
)}
```

**Step 4: Run test to verify it passes**

```bash
npm test --workspace=web -- CustomerCard.test.tsx
```

Expected: PASS

**Step 5: Commit CustomerCard integration**

```bash
git add web/src/components/dashboard/CustomerCard.tsx web/src/components/dashboard/__tests__/CustomerCard.test.tsx
git commit -m "feat: integrate ReviewDecisionModal into CustomerCard"
```

---

## Task 7: Integrate Modal with PaykeyCard

**Files:**

- Modify: `web/src/components/dashboard/PaykeyCard.tsx:118-134`
- Test: `web/src/components/dashboard/__tests__/PaykeyCard.integration.test.tsx`

**Step 1: Write failing test for modal integration**

Add to `web/src/components/dashboard/__tests__/PaykeyCard.integration.test.tsx`:

```typescript
describe('PaykeyCard - Review Modal Integration', () => {
  it('should open modal when review button clicked', () => {
    const paykey = {
      id: 'paykey_123',
      paykey: 'token_123',
      customer_id: 'cust_123',
      status: 'review',
      institution_name: 'Chase Bank',
      balance: { account_balance: 100000 },
      created_at: '2025-01-01T00:00:00Z',
    };

    const { getByText, queryByText } = render(
      <PaykeyCard />,
      {
        initialState: { paykey },
      }
    );

    expect(queryByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).not.toBeInTheDocument();

    fireEvent.click(getByText('REVIEW'));

    expect(getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
  });

  it('should call API and update state on approve', async () => {
    const paykey = {
      id: 'paykey_123',
      paykey: 'token_123',
      customer_id: 'cust_123',
      status: 'review',
      institution_name: 'Chase Bank',
      balance: { account_balance: 100000 },
      created_at: '2025-01-01T00:00:00Z',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'paykey_123', status: 'active' }),
    });

    const { getByText } = render(
      <PaykeyCard />,
      {
        initialState: { paykey },
      }
    );

    fireEvent.click(getByText('REVIEW'));
    fireEvent.click(getByText('APPROVE'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/paykeys/paykey_123/review',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ decision: 'approved' }),
        })
      );
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --workspace=web -- PaykeyCard.integration.test.tsx
```

Expected: FAIL

**Step 3: Integrate modal into PaykeyCard**

Modify `web/src/components/dashboard/PaykeyCard.tsx`:

```typescript
// Add imports
import { ReviewDecisionModal } from '@/components/ReviewDecisionModal';
import { paykeyReviewDecision } from '@/lib/api';

// Add state
const [isModalOpen, setIsModalOpen] = useState(false);

// Replace review button onClick (lines 118-134)
<button
  onClick={() => setIsModalOpen(true)}
  className={cn(
    'px-2 py-1 text-xs font-pixel uppercase transition-all',
    'bg-gold/20 text-gold border border-gold/40 rounded-pixel',
    'hover:bg-gold/30 hover:border-gold/60',
    'animate-pulse',
    'cursor-pointer'
  )}
>
  REVIEW
</button>

// Add modal before closing </RetroCard>
{paykey.status === 'review' && (
  <ReviewDecisionModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onDecision={async (decision) => {
      const logId = useDemoStore.getState().addAPILogEntry({
        type: 'ui-action',
        text: `Paykey review decision: ${decision}`,
      });

      try {
        await paykeyReviewDecision(paykey.id, decision as 'approved' | 'rejected');
        // State updates via SSE
      } catch (error) {
        console.error('Failed to update paykey review:', error);
        useDemoStore.getState().addTerminalLine({
          text: `Error: ${error instanceof Error ? error.message : 'Failed to update review'}`,
          type: 'error',
        });
      }
    }}
    data={{
      type: 'paykey',
      id: paykey.id,
      customerName: getCustomerName(),
      institution: truncateBankName(paykey.institution_name || paykey.label),
      balance: balance,
      status: paykey.status,
      verificationSummary: hasVerificationData(paykey)
        ? {
            nameMatch:
              paykey.review?.verification_details?.breakdown?.name_match?.decision || 'unknown',
            accountValidation:
              paykey.review?.verification_details?.breakdown?.account_validation?.decision ||
              'unknown',
          }
        : undefined,
    }}
  />
)}
```

**Step 4: Run test to verify it passes**

```bash
npm test --workspace=web -- PaykeyCard.integration.test.tsx
```

Expected: PASS

**Step 5: Commit PaykeyCard integration**

```bash
git add web/src/components/dashboard/PaykeyCard.tsx web/src/components/dashboard/__tests__/PaykeyCard.integration.test.tsx
git commit -m "feat: integrate ReviewDecisionModal into PaykeyCard"
```

---

## Task 8: Add Pixel Skull Icon for Rejected Status

**Files:**

- Create: `web/src/components/ui/PixelSkull.tsx`
- Modify: `web/src/components/dashboard/CustomerCard.tsx`
- Modify: `web/src/components/dashboard/PaykeyCard.tsx`

**Step 1: Create pixel skull icon component**

Create `web/src/components/ui/PixelSkull.tsx`:

```typescript
import React from 'react';

interface PixelSkullProps {
  className?: string;
  size?: number;
}

/**
 * Retro pixel art skull icon for rejected status
 */
export const PixelSkull: React.FC<PixelSkullProps> = ({ className = '', size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Skull outline */}
      <rect x="4" y="2" width="8" height="10" fill="currentColor" />
      {/* Eyes */}
      <rect x="6" y="5" width="2" height="2" fill="black" />
      <rect x="10" y="5" width="2" height="2" fill="black" />
      {/* Nose */}
      <rect x="8" y="8" width="1" height="1" fill="black" />
      {/* Teeth */}
      <rect x="6" y="10" width="1" height="2" fill="black" />
      <rect x="8" y="10" width="1" height="2" fill="black" />
      <rect x="10" y="10" width="1" height="2" fill="black" />
    </svg>
  );
};
```

**Step 2: Add skull to CustomerCard for rejected status**

Modify `web/src/components/dashboard/CustomerCard.tsx`:

```typescript
// Import skull
import { PixelSkull } from '@/components/ui/PixelSkull';

// Update badge rendering (around line 291)
{status === 'review' ? (
  <button
    onClick={() => setIsModalOpen(true)}
    className={cn(
      'px-2 py-1 text-xs font-pixel uppercase transition-all',
      'bg-gold/20 text-gold border border-gold/40 rounded-pixel',
      'hover:bg-gold/30 hover:border-gold/60',
      'animate-pulse',
      'cursor-pointer'
    )}
  >
    {status.toUpperCase()}
  </button>
) : status === 'rejected' ? (
  <div className="flex items-center gap-1 px-2 py-1 bg-accent/20 border border-accent/40 rounded-pixel">
    <PixelSkull className="text-accent" size={12} />
    <span className="text-xs font-pixel text-accent">REJECTED</span>
  </div>
) : (
  <RetroBadge variant={statusColors[status]}>{status.toUpperCase()}</RetroBadge>
)}
```

**Step 3: Add skull to PaykeyCard for rejected status**

Modify `web/src/components/dashboard/PaykeyCard.tsx`:

```typescript
// Import skull
import { PixelSkull } from '@/components/ui/PixelSkull';

// Update badge rendering (around line 118)
{paykey.status === 'review' ? (
  <button
    onClick={() => setIsModalOpen(true)}
    className={cn(
      'px-2 py-1 text-xs font-pixel uppercase transition-all',
      'bg-gold/20 text-gold border border-gold/40 rounded-pixel',
      'hover:bg-gold/30 hover:border-gold/60',
      'animate-pulse',
      'cursor-pointer'
    )}
  >
    REVIEW
  </button>
) : paykey.status === 'rejected' ? (
  <div className="flex items-center gap-1 px-2 py-1 bg-accent/20 border border-accent/40 rounded-pixel">
    <PixelSkull className="text-accent" size={12} />
    <span className="text-xs font-pixel text-accent">REJECTED</span>
  </div>
) : (
  <RetroBadge variant={statusColor}>{paykey.status.toUpperCase()}</RetroBadge>
)}
```

**Step 4: Commit skull icon**

```bash
git add web/src/components/ui/PixelSkull.tsx web/src/components/dashboard/CustomerCard.tsx web/src/components/dashboard/PaykeyCard.tsx
git commit -m "feat: add pixel skull icon for rejected status"
```

---

## Task 9: Integration Testing and Manual Verification

**Files:**

- Create: `web/src/components/__tests__/ReviewDecision.integration.test.tsx`

**Step 1: Write integration test**

Create `web/src/components/__tests__/ReviewDecision.integration.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useDemoStore } from '@/lib/state';
import { CustomerCard } from '@/components/dashboard/CustomerCard';
import { PaykeyCard } from '@/components/dashboard/PaykeyCard';

describe('Review Decision Integration', () => {
  beforeEach(() => {
    // Reset store
    useDemoStore.getState().reset();

    // Mock fetch
    global.fetch = jest.fn();
  });

  it('should complete customer review flow end-to-end', async () => {
    const customer = {
      id: 'cust_123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+12125550123',
      verification_status: 'review',
      type: 'individual' as const,
      created_at: '2025-01-01T00:00:00Z',
      review: {
        review_id: 'rev_123',
        decision: 'review',
        breakdown: {
          email: { decision: 'accept', risk_score: 0.1 },
          phone: { decision: 'accept', risk_score: 0.1 },
        },
      },
    };

    // Set initial state
    useDemoStore.setState({ customer });

    // Mock API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'cust_123', status: 'verified' }),
    });

    const { getByText } = render(<CustomerCard />);

    // Open modal
    fireEvent.click(getByText('REVIEW'));

    // Verify modal appears
    expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();

    // Approve
    fireEvent.click(getByText('APPROVE'));

    // Verify API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/customers/cust_123/review'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'verified' }),
        })
      );
    });

    // Verify terminal log
    await waitFor(() => {
      const state = useDemoStore.getState();
      expect(state.terminalHistory.some(line =>
        line.text.includes('Customer review decision')
      )).toBe(true);
    });
  });

  it('should complete paykey review flow end-to-end', async () => {
    const paykey = {
      id: 'paykey_123',
      paykey: 'token_123',
      customer_id: 'cust_123',
      status: 'review',
      institution_name: 'Chase Bank',
      balance: { account_balance: 100000, status: 'completed' },
      created_at: '2025-01-01T00:00:00Z',
    };

    useDemoStore.setState({ paykey });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'paykey_123', status: 'active' }),
    });

    const { getByText } = render(<PaykeyCard />);

    fireEvent.click(getByText('REVIEW'));

    expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();

    fireEvent.click(getByText('REJECT'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/paykeys/paykey_123/review'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ decision: 'rejected' }),
        })
      );
    });
  });
});
```

**Step 2: Run integration test**

```bash
npm test --workspace=web -- ReviewDecision.integration.test.tsx
```

Expected: PASS

**Step 3: Commit integration tests**

```bash
git add web/src/components/__tests__/ReviewDecision.integration.test.tsx
git commit -m "test: add end-to-end integration tests for review decision flow"
```

**Step 4: Manual verification checklist**

Run the dev server and manually verify:

```bash
npm run dev
```

In browser at `http://localhost:5173`:

1. ☐ Run `/customer-create --outcome review`
2. ☐ Verify "REVIEW" button appears on CustomerCard
3. ☐ Click "REVIEW" button → modal opens with challenge title
4. ☐ Verify customer data displays correctly in modal
5. ☐ Click "APPROVE" → green animation plays, modal closes
6. ☐ Verify terminal shows decision log entry
7. ☐ Verify CustomerCard updates to "VERIFIED" status
8. ☐ Run `/customer-create --outcome review` again
9. ☐ Click "REJECT" → red flash + shake + "REJECTED" text appears
10. ☐ Verify CustomerCard shows skull icon + "REJECTED"
11. ☐ Run `/create-paykey bank --outcome review`
12. ☐ Verify "REVIEW" button on PaykeyCard
13. ☐ Click "REVIEW" → modal shows paykey data (bank, balance)
14. ☐ Test approve and reject flows for paykey
15. ☐ Check browser console for any errors
16. ☐ Verify API logs appear in Logs tab

**Step 5: Document manual test results**

Create manual test report:

```bash
echo "# Manual Test Report - Review Decision Feature

Date: $(date)

## Customer Review Flow
- [ ] Review button appears: PASS/FAIL
- [ ] Modal opens: PASS/FAIL
- [ ] Approve animation: PASS/FAIL
- [ ] Reject animation: PASS/FAIL
- [ ] Terminal logging: PASS/FAIL
- [ ] State updates: PASS/FAIL

## Paykey Review Flow
- [ ] Review button appears: PASS/FAIL
- [ ] Modal opens: PASS/FAIL
- [ ] Approve animation: PASS/FAIL
- [ ] Reject animation: PASS/FAIL
- [ ] Terminal logging: PASS/FAIL
- [ ] State updates: PASS/FAIL

## Animation Quality
- [ ] Screen shake intensity: PASS/FAIL
- [ ] Red flash visibility: PASS/FAIL
- [ ] Green glow effect: PASS/FAIL
- [ ] Pixel skull icon: PASS/FAIL

## Notes
[Add any observations or issues here]
" > docs/manual-test-report.md

git add docs/manual-test-report.md
git commit -m "docs: add manual test report template"
```

---

## Task 10: Run Full Test Suite and Type Check

**Step 1: Run all tests**

```bash
npm test
```

Expected: All tests PASS

**Step 2: Run type check**

```bash
npm run type-check
```

Expected: No TypeScript errors

**Step 3: Run linter**

```bash
npm run lint
```

Expected: No linting errors (or only warnings)

**Step 4: Build project**

```bash
npm run build
```

Expected: Build succeeds without errors

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: final verification - all tests passing"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2025-01-17-review-decision-modal.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
