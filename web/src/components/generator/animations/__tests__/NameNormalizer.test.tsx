import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { NameNormalizer } from '../NameNormalizer';

describe('NameNormalizer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should call onComplete with normalized name after 1500ms', () => {
    const onComplete = vi.fn();
    const customerName = 'John Smith Jr.';
    const expectedNormalized = 'john smith jr';

    render(<NameNormalizer customerName={customerName} onComplete={onComplete} />);

    // Should not call onComplete immediately
    expect(onComplete).not.toHaveBeenCalled();

    // Advance time to 300ms (original stage)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onComplete).not.toHaveBeenCalled();

    // Advance time to 1200ms (morphing stage)
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(onComplete).not.toHaveBeenCalled();

    // Advance time to 1500ms (should complete)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(expectedNormalized);
  });

  it('should cleanup timers on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(<NameNormalizer customerName="Test Name" onComplete={onComplete} />);

    // Unmount before completion
    unmount();
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should not call onComplete after unmount
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should show normalizing state initially', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <NameNormalizer customerName="Test Name" onComplete={onComplete} />
    );

    // Initial stage should show original name
    expect(container.textContent).toContain('Test Name');

    // Advance to morphing stage
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(container.textContent).toContain('NORMALIZING...');

    // Advance to normalized stage
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(container.textContent).toContain('COMPLETE');
  });
});
