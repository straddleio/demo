import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BusinessOutcomeModal } from '../BusinessOutcomeModal';

describe('BusinessOutcomeModal', () => {
  it('renders when isOpen is true', () => {
    render(
      <BusinessOutcomeModal isOpen={true} onClose={vi.fn()} onSelectOutcome={vi.fn()} />
    );

    expect(screen.getByText('CREATE BUSINESS CUSTOMER')).toBeInTheDocument();
    expect(screen.getByText(/The Bluth Company/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <BusinessOutcomeModal isOpen={false} onClose={vi.fn()} onSelectOutcome={vi.fn()} />
    );

    expect(screen.queryByText('CREATE BUSINESS CUSTOMER')).not.toBeInTheDocument();
  });

  it('renders all four outcome buttons', () => {
    render(
      <BusinessOutcomeModal isOpen={true} onClose={vi.fn()} onSelectOutcome={vi.fn()} />
    );

    expect(screen.getByText('⚡ Standard')).toBeInTheDocument();
    expect(screen.getByText('✓ Verified')).toBeInTheDocument();
    expect(screen.getByText('⚠ Review')).toBeInTheDocument();
    expect(screen.getByText('✗ Rejected')).toBeInTheDocument();
  });

  it('calls onSelectOutcome and onClose when standard button is clicked', () => {
    const onSelectOutcome = vi.fn();
    const onClose = vi.fn();

    render(
      <BusinessOutcomeModal
        isOpen={true}
        onClose={onClose}
        onSelectOutcome={onSelectOutcome}
      />
    );

    fireEvent.click(screen.getByText('⚡ Standard'));

    expect(onSelectOutcome).toHaveBeenCalledWith('standard');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSelectOutcome and onClose when verified button is clicked', () => {
    const onSelectOutcome = vi.fn();
    const onClose = vi.fn();

    render(
      <BusinessOutcomeModal
        isOpen={true}
        onClose={onClose}
        onSelectOutcome={onSelectOutcome}
      />
    );

    fireEvent.click(screen.getByText('✓ Verified'));

    expect(onSelectOutcome).toHaveBeenCalledWith('verified');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSelectOutcome and onClose when review button is clicked', () => {
    const onSelectOutcome = vi.fn();
    const onClose = vi.fn();

    render(
      <BusinessOutcomeModal
        isOpen={true}
        onClose={onClose}
        onSelectOutcome={onSelectOutcome}
      />
    );

    fireEvent.click(screen.getByText('⚠ Review'));

    expect(onSelectOutcome).toHaveBeenCalledWith('review');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSelectOutcome and onClose when rejected button is clicked', () => {
    const onSelectOutcome = vi.fn();
    const onClose = vi.fn();

    render(
      <BusinessOutcomeModal
        isOpen={true}
        onClose={onClose}
        onSelectOutcome={onSelectOutcome}
      />
    );

    fireEvent.click(screen.getByText('✗ Rejected'));

    expect(onSelectOutcome).toHaveBeenCalledWith('rejected');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button (✕) is clicked', () => {
    const onClose = vi.fn();

    render(
      <BusinessOutcomeModal isOpen={true} onClose={onClose} onSelectOutcome={vi.fn()} />
    );

    fireEvent.click(screen.getByText('✕'));

    expect(onClose).toHaveBeenCalled();
  });
});
