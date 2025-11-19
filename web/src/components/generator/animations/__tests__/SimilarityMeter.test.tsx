import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SimilarityMeter } from '../SimilarityMeter';

describe('SimilarityMeter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const defaultProps = {
    variations: ['john smith', 'j smith', 'john s'],
    namesOnAccount: ['Jane Doe', 'John Smith', 'Bob Johnson'],
    matchedName: 'John Smith',
    correlationScore: 85,
    onComplete: vi.fn(),
  };

  it('should render with customer and matched names', () => {
    const { container } = render(<SimilarityMeter {...defaultProps} />);

    // Should show all account names
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    // Should show account count
    expect(container.textContent).toContain('Account Names (3)');

    // Should show WALDO Confidence meter
    expect(screen.getByText('WALDO Confidence')).toBeInTheDocument();
  });

  it('should progress through all 4 stages correctly', () => {
    const { container } = render(<SimilarityMeter {...defaultProps} />);

    // Stage 1: comparing (0-500ms)
    expect(container.textContent).not.toContain('Matched');
    expect(container.textContent).not.toContain('Comparing');

    // Stage 2: matched (500-1000ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText('Matched')).toBeInTheDocument();
    expect(container.textContent).toContain('Comparing 3 variation pairs');

    // Stage 3: scoring (1000-2000ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // Progress bar should start animating
    expect(screen.getByText('Matched')).toBeInTheDocument();

    // Stage 4: complete (2000-2500ms)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Score interpretation should appear
    expect(screen.getByText('Good Match')).toBeInTheDocument();
  });

  it('should display correlation score percentage', () => {
    const props = {
      ...defaultProps,
      correlationScore: 92,
    };
    render(<SimilarityMeter {...props} />);

    // Initial state should show 0%
    const initialPercentages = screen.getAllByText('0%');
    expect(initialPercentages.length).toBeGreaterThan(0);

    // Advance to scoring stage
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Advance through scoring animation
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should show final score
    const percentageElements = screen.getAllByText('92%');
    expect(percentageElements.length).toBeGreaterThan(0);
  });

  it('should animate progress bar to score value during scoring stage', () => {
    const props = {
      ...defaultProps,
      correlationScore: 75,
    };
    render(<SimilarityMeter {...props} />);

    // Before scoring stage
    act(() => {
      vi.advanceTimersByTime(900);
    });
    const initialPercentages = screen.getAllByText('0%');
    expect(initialPercentages.length).toBeGreaterThan(0);

    // Start of scoring stage
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Advance through scoring animation (score should increment)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Complete scoring stage
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Final score should be displayed
    const percentageElements = screen.getAllByText('75%');
    expect(percentageElements.length).toBeGreaterThan(0);
  });

  it('should call onComplete after final stage at 2500ms', () => {
    const onComplete = vi.fn();
    render(<SimilarityMeter {...defaultProps} onComplete={onComplete} />);

    // Should not call onComplete immediately
    expect(onComplete).not.toHaveBeenCalled();

    // Advance to matched stage (500ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onComplete).not.toHaveBeenCalled();

    // Advance to scoring stage (1000ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onComplete).not.toHaveBeenCalled();

    // Advance to complete stage (2000ms)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onComplete).not.toHaveBeenCalled();

    // Advance to onComplete call (2500ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should clean up timers and intervals on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(<SimilarityMeter {...defaultProps} onComplete={onComplete} />);

    // Advance to scoring stage to start score interval
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Unmount before completion
    unmount();

    // Advance time past completion
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should not call onComplete after unmount
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should show correct score interpretation based on correlation score', () => {
    const testCases = [
      { score: 95, interpretation: 'High Confidence Match' },
      { score: 85, interpretation: 'Good Match' },
      { score: 70, interpretation: 'Moderate Match' },
      { score: 50, interpretation: 'Low Confidence' },
    ];

    testCases.forEach(({ score, interpretation }) => {
      const { unmount } = render(<SimilarityMeter {...defaultProps} correlationScore={score} />);

      // Advance to complete stage
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText(interpretation)).toBeInTheDocument();
      unmount();
    });
  });

  it('should highlight matched name with checkmark after comparing stage', () => {
    const { container } = render(<SimilarityMeter {...defaultProps} />);

    // During comparing stage, should not show checkmark
    expect(container.textContent).not.toContain('✓');

    // After comparing stage, should show checkmark for matched name
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(container.textContent).toContain('✓');
    expect(screen.getByText('Matched')).toBeInTheDocument();
  });

  it('should display variation count in comparison progress', () => {
    const props = {
      ...defaultProps,
      variations: ['alice', 'alice doe', 'a doe', 'alice d'],
    };
    render(<SimilarityMeter {...props} />);

    // Advance to matched stage
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText('Comparing 4 variation pairs...')).toBeInTheDocument();
  });
});
