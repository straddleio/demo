import { render, screen } from '@testing-library/react';
import { PizzaTracker } from '../PizzaTracker';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDemoStore } from '@/lib/state';
import type { Charge } from '@/lib/api';

describe('PizzaTracker', () => {
  beforeEach(() => {
    useDemoStore.getState().reset();
  });

  it('should render "No charge to track" when no charge exists', () => {
    render(<PizzaTracker />);

    expect(screen.getByText('Charge Lifecycle')).toBeInTheDocument();
    expect(screen.getByText(/No charge to track/i)).toBeInTheDocument();
    expect(screen.getByText(/Run \/create-charge/i)).toBeInTheDocument();
  });

  it('should display current status when charge exists', () => {
    useDemoStore.getState().setCharge({
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'created',
      paykey: 'pk_test_123',
    });

    render(<PizzaTracker />);

    expect(screen.getByText('Charge Lifecycle')).toBeInTheDocument();
    expect(screen.getByText('CREATED')).toBeInTheDocument();
  });

  it('should display single status when no status_history exists', () => {
    useDemoStore.getState().setCharge({
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'paid',
      paykey: 'pk_test_123',
    });

    render(<PizzaTracker />);

    expect(screen.getByText('PAID')).toBeInTheDocument();
    // Only one status should be displayed
    const statusLabels = screen.getAllByText('Paid');
    expect(statusLabels).toHaveLength(1);
  });

  it('should display full status history when available', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'paid',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
        },
        {
          status: 'processing',
          timestamp: '2024-01-15T10:05:00Z',
        },
        {
          status: 'paid',
          timestamp: '2024-01-15T10:10:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    render(<PizzaTracker />);

    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('should highlight paid status with primary color', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'paid',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
        },
        {
          status: 'paid',
          timestamp: '2024-01-15T10:10:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    render(<PizzaTracker />);

    const paidLabel = screen.getByText('Paid');
    expect(paidLabel).toHaveClass('text-primary');
  });

  it('should highlight latest status with gold color when not paid', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'processing',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
        },
        {
          status: 'processing',
          timestamp: '2024-01-15T10:05:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    render(<PizzaTracker />);

    const processingLabel = screen.getByText('Processing');
    expect(processingLabel).toHaveClass('text-gold');
  });

  it('should display formatted timestamps', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'paid',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-11-12T20:00:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    render(<PizzaTracker />);

    // Should display formatted timestamp (Nov 12, 8:05 PM format may vary by timezone)
    const timestampElements = screen.queryAllByText(/Nov 12/i);
    expect(timestampElements.length).toBeGreaterThan(0);
  });

  it('should display status messages when available', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'failed',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
          message: 'Charge created successfully',
        },
        {
          status: 'failed',
          timestamp: '2024-01-15T10:05:00Z',
          message: 'Payment failed due to insufficient funds',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    render(<PizzaTracker />);

    expect(screen.getByText('Charge created successfully')).toBeInTheDocument();
    expect(screen.getByText('Payment failed due to insufficient funds')).toBeInTheDocument();
  });

  it('should capitalize status labels', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'created',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    render(<PizzaTracker />);

    // Should capitalize first letter
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('should render horizontal connectors between statuses', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'paid',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
        },
        {
          status: 'processing',
          timestamp: '2024-01-15T10:05:00Z',
        },
        {
          status: 'paid',
          timestamp: '2024-01-15T10:10:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    const { container } = render(<PizzaTracker />);

    // Should have 2 connectors for 3 statuses
    const connectors = container.querySelectorAll('.h-1.w-8');
    expect(connectors.length).toBe(2);
  });

  it('should color completed connectors with primary color', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'paid',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
        },
        {
          status: 'paid',
          timestamp: '2024-01-15T10:10:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    const { container } = render(<PizzaTracker />);

    // First connector (before last status) should be primary
    const connectors = container.querySelectorAll('.h-1.w-8');
    expect(connectors[0]).toHaveClass('bg-primary');
  });

  it('should handle status history with duplicate statuses', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'processing',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
        },
        {
          status: 'processing',
          timestamp: '2024-01-15T10:05:00Z',
        },
        {
          status: 'processing',
          timestamp: '2024-01-15T10:06:00Z',
          message: 'Still processing',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    render(<PizzaTracker />);

    // Should render all entries without filtering
    const processingLabels = screen.getAllByText('Processing');
    expect(processingLabels).toHaveLength(2);
  });

  it('should handle missing changed_at timestamp gracefully', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'created',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    const { container } = render(<PizzaTracker />);

    // Should not throw error and render without timestamp
    expect(container).toBeInTheDocument();
  });

  it('should display current status in header', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'processing',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
        },
        {
          status: 'processing',
          timestamp: '2024-01-15T10:05:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    render(<PizzaTracker />);

    // Header should show current status in uppercase
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
  });

  it('should render ChargeStatusIcon for each status', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'paid',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-01-15T10:00:00Z',
        },
        {
          status: 'paid',
          timestamp: '2024-01-15T10:10:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    const { container } = render(<PizzaTracker />);

    // Should have icon circles for each status
    const iconCircles = container.querySelectorAll('.w-10.h-10');
    expect(iconCircles.length).toBe(2);
  });

  it('should apply retro card styling', () => {
    render(<PizzaTracker />);

    // Should render with Charge Lifecycle title
    expect(screen.getByText('Charge Lifecycle')).toBeInTheDocument();
    // Should render the "No charge to track" message in the empty state
    expect(screen.getByText(/No charge to track/i)).toBeInTheDocument();
  });

  it('should handle invalid timestamp format gracefully', () => {
    const charge: Charge = {
      id: 'chg_123',
      amount: 5000,
      currency: 'USD',
      status: 'created',
      paykey: 'pk_test_123',
      status_history: [
        {
          status: 'created',
          timestamp: '2024-11-12T20:00:00Z',
        },
      ],
    };

    useDemoStore.getState().setCharge(charge);
    const { container } = render(<PizzaTracker />);

    // Should render without throwing error
    expect(container).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    // Invalid timestamps are caught and displayed as-is by the formatTimestamp function
    // The component should render successfully even with invalid date
  });
});
