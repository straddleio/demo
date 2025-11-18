import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { PaykeyCard } from '../PaykeyCard';
import { useDemoStore } from '@/lib/state';
import * as api from '@/lib/api';

vi.mock('@/lib/state');
vi.mock('@/lib/api');

describe('PaykeyCard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should display name match verification for plaid paykey', () => {
    const mockPaykey = {
      id: 'pk_123',
      status: 'active',
      source: 'plaid',
      institution_name: 'Chase Bank',
      review: {
        verification_details: {
          breakdown: {
            name_match: {
              decision: 'accept',
              correlation_score: 0.95,
              customer_name: 'John Smith',
              matched_name: 'John A Smith',
            },
          },
        },
      },
    };

    vi.mocked(useDemoStore).mockImplementation(<T,>(selector: (state: any) => T): T => {
      return selector({
        paykey: mockPaykey,
        customer: { name: 'John Smith' },
      });
    });

    const { getByText } = render(<PaykeyCard />);

    // Click SHOW to expand
    fireEvent.click(getByText('SHOW'));

    // Should display name match content
    expect(getByText('Name Match')).toBeInTheDocument();
    expect(
      getByText((_content, element) => {
        return element?.textContent === '• HIGH';
      })
    ).toBeInTheDocument();
    expect(getByText('Correlation Score')).toBeInTheDocument();
    expect(getByText('Customer:')).toBeInTheDocument();
    expect(getByText('Matched:')).toBeInTheDocument();
    expect(getByText('John A Smith')).toBeInTheDocument();
  });

  it('should display account validation for bank_account paykey', () => {
    const mockPaykey = {
      id: 'pk_456',
      status: 'review',
      source: 'bank_account',
      institution_name: 'Wells Fargo',
      review: {
        verification_details: {
          breakdown: {
            account_validation: {
              decision: 'review',
              reason: 'Manual review required',
              codes: ['BR001'],
            },
          },
          messages: {
            BR001: 'Risk indicator detected',
          },
        },
      },
    };

    vi.mocked(useDemoStore).mockImplementation(<T,>(selector: (state: any) => T): T => {
      return selector({
        paykey: mockPaykey,
        customer: null,
      });
    });

    const { getByText, getByRole } = render(<PaykeyCard />);

    // Should show pulsing REVIEW button
    const reviewButton = getByRole('button', { name: 'REVIEW' });
    expect(reviewButton.className).toContain('animate-pulse');

    // Click SHOW to expand
    fireEvent.click(getByText('SHOW'));

    // Should display account validation content
    expect(getByText('Account Validation')).toBeInTheDocument();
    expect(getByText('Manual review required')).toBeInTheDocument();
    expect(getByText('BR001')).toBeInTheDocument();
    expect(getByText('Risk indicator detected')).toBeInTheDocument();
  });

  it('should open modal when review button clicked', () => {
    const mockPaykey = {
      id: 'pk_review',
      status: 'review',
      source: 'plaid',
      institution_name: 'JPMORGAN CHASE BANK, NA',
      balance: { account_balance: 500000 },
      review: {
        verification_details: {
          breakdown: {
            name_match: {
              decision: 'review',
              customer_name: 'Alice Johnson',
            },
          },
        },
      },
    };

    vi.mocked(useDemoStore).mockImplementation(<T,>(selector: (state: any) => T): T => {
      return selector({
        paykey: mockPaykey,
        customer: { name: 'Alice Johnson' },
      });
    });

    const { getByRole, getByText, getAllByText } = render(<PaykeyCard />);

    // Click REVIEW button
    const reviewButton = getByRole('button', { name: 'REVIEW' });
    fireEvent.click(reviewButton);

    // Modal should be open
    expect(getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
    // Should have bank name in both card and modal
    expect(getAllByText('JPMORGAN CHASE BANK').length).toBeGreaterThan(0);
    expect(getByText('RENDER YOUR VERDICT')).toBeInTheDocument();
    expect(getByText('APPROVE')).toBeInTheDocument();
    expect(getByText('REJECT')).toBeInTheDocument();
  });

  it('should call API on approve decision', async () => {
    const mockPaykey = {
      id: 'pk_approve',
      status: 'review',
      source: 'plaid',
      institution_name: 'Wells Fargo',
      balance: { account_balance: 300000 },
      review: {
        verification_details: {
          breakdown: {
            name_match: {
              decision: 'review',
              customer_name: 'Bob Smith',
            },
          },
        },
      },
    };

    const mockAddAPILogEntry = vi.fn();
    vi.mocked(useDemoStore).mockImplementation(<T,>(selector: (state: any) => T): T => {
      return selector({
        paykey: mockPaykey,
        customer: { name: 'Bob Smith' },
        addAPILogEntry: mockAddAPILogEntry,
      });
    });

    // Mock the getState method to return addAPILogEntry
    vi.mocked(useDemoStore).getState = vi.fn().mockReturnValue({
      addAPILogEntry: mockAddAPILogEntry,
    });

    vi.mocked(api.paykeyReviewDecision).mockResolvedValue({});

    const { getByRole, getByText } = render(<PaykeyCard />);

    // Open modal
    const reviewButton = getByRole('button', { name: 'REVIEW' });
    fireEvent.click(reviewButton);

    // Click APPROVE
    const approveButton = getByText('APPROVE');
    fireEvent.click(approveButton);

    // Wait for API call
    await waitFor(() => {
      expect(api.paykeyReviewDecision).toHaveBeenCalledWith('pk_approve', 'approved');
    });
  });

  it('should call API on reject decision', async () => {
    const mockPaykey = {
      id: 'pk_reject',
      status: 'review',
      source: 'bank_account',
      institution_name: 'Bank of America',
      balance: { account_balance: 100000 },
      review: {
        verification_details: {
          breakdown: {
            account_validation: {
              decision: 'review',
              reason: 'Risk detected',
            },
          },
        },
      },
    };

    const mockAddAPILogEntry = vi.fn();
    vi.mocked(useDemoStore).mockImplementation(<T,>(selector: (state: any) => T): T => {
      return selector({
        paykey: mockPaykey,
        customer: { name: 'Charlie Brown' },
        addAPILogEntry: mockAddAPILogEntry,
      });
    });

    // Mock the getState method to return addAPILogEntry
    vi.mocked(useDemoStore).getState = vi.fn().mockReturnValue({
      addAPILogEntry: mockAddAPILogEntry,
    });

    vi.mocked(api.paykeyReviewDecision).mockResolvedValue({});

    const { getByRole, getByText } = render(<PaykeyCard />);

    // Open modal
    const reviewButton = getByRole('button', { name: 'REVIEW' });
    fireEvent.click(reviewButton);

    // Click REJECT
    const rejectButton = getByText('REJECT');
    fireEvent.click(rejectButton);

    // Wait for API call
    await waitFor(() => {
      expect(api.paykeyReviewDecision).toHaveBeenCalledWith('pk_reject', 'rejected');
    });
  });
});
