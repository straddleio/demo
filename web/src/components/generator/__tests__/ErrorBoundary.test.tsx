import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GeneratorErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }): JSX.Element => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('GeneratorErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when no error', () => {
    render(
      <GeneratorErrorBoundary onError={vi.fn()}>
        <ThrowError shouldThrow={false} />
      </GeneratorErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should show error message when child throws', () => {
    const onError = vi.fn();

    render(
      <GeneratorErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </GeneratorErrorBoundary>
    );

    expect(screen.getByText(/animation error/i)).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <GeneratorErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </GeneratorErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
