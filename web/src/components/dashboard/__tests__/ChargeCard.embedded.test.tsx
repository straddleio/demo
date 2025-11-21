import { render, screen, fireEvent } from '@testing-library/react';
import { ChargeCard } from '../ChargeCard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDemoStore } from '@/lib/state';

// Mock the Zustand store
vi.mock('@/lib/state', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCharge: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPaykey: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDisplayState: any = {};

  return {
    useDemoStore: Object.assign(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      vi.fn((selector: ((state: unknown) => unknown) | undefined) => {
        const mockState = {
          charge: mockCharge,
          paykey: mockPaykey,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          getCardDisplayState: () => mockDisplayState,
        };
        if (!selector) {
          return mockState;
        }
        return selector(mockState);
      }),
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setState: (updates: any) => {
          if (updates.charge !== undefined) {
            mockCharge = updates.charge;
          }
          if (updates.paykey !== undefined) {
            mockPaykey = updates.paykey;
          }
          if (updates.displayState !== undefined) {
            mockDisplayState = updates.displayState;
          }
        },
      }
    ),
  };
});

describe('ChargeCard with Embedded Paykey', () => {
  const mockCharge = {
    id: 'chg_123',
    amount: 5000,
    status: 'created',
    payment_rail: 'ach',
  };

  const mockPaykey = {
    id: 'pk_123',
    status: 'active',
    institution_name: 'Chase Bank',
    balance: { account_balance: 100000 },
    last4: '1234',
  };

  beforeEach(() => {
    // Set up mock state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useDemoStore as any).setState({
      charge: mockCharge,
      paykey: mockPaykey,
      displayState: {
        paykeyMode: 'embedded',
        chargeMode: 'with-embedded-paykey',
      },
    });
  });

  it('renders charge amount and header', () => {
    render(<ChargeCard />);
    expect(screen.getByText('Charge')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('shows green key icon when paykey is embedded', () => {
    render(<ChargeCard />);
    const keyButton = screen.getByRole('button', { name: /toggle paykey details/i });
    expect(keyButton).toBeInTheDocument();
    expect(keyButton).toHaveAttribute('aria-label', 'Toggle paykey details');
  });

  it('expands paykey details when key icon is clicked', () => {
    render(<ChargeCard />);

    const keyButton = screen.getByRole('button', { name: /toggle paykey details/i });
    fireEvent.click(keyButton);

    const details = screen.getByTestId('embedded-paykey-details');
    expect(details).toBeInTheDocument();
    expect(details).toHaveTextContent('PAYKEY');
    expect(details).toHaveTextContent('Chase Bank');
    expect(details).toHaveTextContent('••••1234');
    expect(details).toHaveTextContent('$1,000.00');
  });

  it('collapses paykey details when clicked again', () => {
    render(<ChargeCard />);

    const keyButton = screen.getByRole('button', { name: /toggle paykey details/i });

    // Expand
    fireEvent.click(keyButton);
    // Collapse
    fireEvent.click(keyButton);
    expect(screen.queryByTestId('embedded-paykey-details')).not.toBeInTheDocument();
  });

  it('does not show key icon when paykey mode is not embedded', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useDemoStore as any).setState({
      charge: mockCharge,
      paykey: null,
      displayState: {
        paykeyMode: 'standalone',
        chargeMode: 'empty',
      },
    });

    render(<ChargeCard />);
    expect(
      screen.queryByRole('button', { name: /toggle paykey details/i })
    ).not.toBeInTheDocument();
  });
});
