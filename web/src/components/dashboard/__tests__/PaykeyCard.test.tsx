import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaykeyCard } from '../PaykeyCard';
import { useDemoStore } from '@/lib/state';

describe('PaykeyCard (Dashboard)', () => {
  beforeEach(() => {
    useDemoStore.getState().reset();
  });

  it('should render "No bank account linked" when no paykey exists', () => {
    render(<PaykeyCard />);
    expect(screen.getByText('Paykey')).toBeInTheDocument();
    expect(screen.getByText(/No bank account linked/i)).toBeInTheDocument();
  });

  it('should render paykey details when paykey exists', () => {
    useDemoStore.getState().setPaykey({
      id: 'pk_123',
      paykey: 'pk_test_123',
      customer_id: 'cust_test_123',
      status: 'active',
      source: 'bank_account',
      label: 'Chase Checking',
      institution_name: 'JPMORGAN CHASE BANK, NA',
      last4: '1234',
      account_type: 'checking',
      balance: {
        account_balance: 500000, // $5000.00
        status: 'completed',
        updated_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(<PaykeyCard />);

    expect(screen.getByText('JPMORGAN CHASE BANK')).toBeInTheDocument();
    expect(screen.getByText('Checking ••••1234')).toBeInTheDocument();
    expect(screen.getByText('$5000.00')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('should toggle verification details', () => {
    useDemoStore.getState().setPaykey({
      id: 'pk_123',
      paykey: 'pk_test_123',
      customer_id: 'cust_test_123',
      status: 'active',
      source: 'bank_account',
      label: 'Chase Checking',
      review: {
        verification_details: {
          breakdown: {
            account_validation: {
              decision: 'accept',
              codes: ['I01'],
            },
          },
        },
      },
    } as unknown as any);

    render(<PaykeyCard />);

    // Initially collapsed
    expect(screen.getByText('SHOW')).toBeInTheDocument();
    expect(screen.queryByText('INFO')).not.toBeInTheDocument();

    // Expand
    fireEvent.click(screen.getByText('SHOW'));
    expect(screen.getByText('HIDE')).toBeInTheDocument();
    expect(screen.getByText('INFO')).toBeInTheDocument();

    // Collapse
    fireEvent.click(screen.getByText('HIDE'));
    expect(screen.getByText('SHOW')).toBeInTheDocument();
  });
});
