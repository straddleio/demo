import { render, screen, fireEvent } from '@testing-library/react';
import { AddressWatchlistCard } from '../AddressWatchlistCard';
import { describe, it, expect } from 'vitest';
import type { Customer } from '@/lib/api';

describe('AddressWatchlistCard', () => {
  const mockCustomerNoWatchlist: Customer = {
    id: 'cust_123',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+12025551234',
    verification_status: 'verified',
    risk_score: 0.25,
  };

  const mockCustomerClearWatchlist: Customer = {
    ...mockCustomerNoWatchlist,
    review: {
      review_id: 'rev_123',
      decision: 'accept',
      breakdown: {},
      watch_list: {
        decision: 'accept',
        codes: [],
        matches: [],
      },
    },
  };

  const mockCustomerWithMatches: Customer = {
    ...mockCustomerNoWatchlist,
    review: {
      review_id: 'rev_456',
      decision: 'review',
      breakdown: {},
      watch_list: {
        decision: 'review',
        codes: ['W01'],
        matches: [
          {
            list_name: 'OFAC SDN List',
            correlation: 'high',
            match_fields: ['name', 'dob'],
            urls: ['https://sanctionslist.ofac.treas.gov/Details.aspx?id=12345'],
          },
          {
            list_name: 'FBI Most Wanted',
            correlation: 'medium',
            match_fields: ['name', 'address'],
            urls: [
              'https://www.fbi.gov/wanted/person1',
              'https://www.fbi.gov/wanted/person2',
            ],
          },
        ],
      },
    },
  };

  const mockCustomerNoUrls: Customer = {
    ...mockCustomerNoWatchlist,
    review: {
      review_id: 'rev_789',
      decision: 'review',
      breakdown: {},
      watch_list: {
        decision: 'review',
        codes: ['W01'],
        matches: [
          {
            list_name: 'Internal Watchlist',
            correlation: 'low',
            match_fields: ['email'],
            urls: [],
          },
        ],
      },
    },
  };

  it('should not render when customer has no watchlist data', () => {
    const { container } = render(<AddressWatchlistCard customer={mockCustomerNoWatchlist} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render with CLEAR status when no matches', () => {
    render(<AddressWatchlistCard customer={mockCustomerClearWatchlist} />);

    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByText('CLEAR')).toBeInTheDocument();
    expect(screen.getByText('CLEAR')).toHaveClass('text-green-500');
  });

  it('should render with FLAGGED status when matches exist', () => {
    render(<AddressWatchlistCard customer={mockCustomerWithMatches} />);

    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByText('FLAGGED')).toBeInTheDocument();
    expect(screen.getByText('FLAGGED')).toHaveClass('text-gold');
    expect(screen.getByText('• 2 matches')).toBeInTheDocument();
  });

  it('should toggle expansion when header is clicked', () => {
    render(<AddressWatchlistCard customer={mockCustomerWithMatches} />);

    // Initially collapsed
    expect(screen.getByText('▶')).toBeInTheDocument();
    expect(screen.queryByText('OFAC SDN List')).not.toBeInTheDocument();

    // Expand
    fireEvent.click(screen.getByText('Watchlist'));
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.getByText('OFAC SDN List')).toBeInTheDocument();

    // Collapse
    fireEvent.click(screen.getByText('Watchlist'));
    expect(screen.getByText('▶')).toBeInTheDocument();
    expect(screen.queryByText('OFAC SDN List')).not.toBeInTheDocument();
  });

  it('should respect parent expansion state', () => {
    render(<AddressWatchlistCard customer={mockCustomerWithMatches} isExpanded={true} />);

    // Should be expanded due to parent state
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.getByText('OFAC SDN List')).toBeInTheDocument();
  });

  it('should display all match details when expanded', () => {
    render(<AddressWatchlistCard customer={mockCustomerWithMatches} isExpanded={true} />);

    // First match
    expect(screen.getByText('OFAC SDN List')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getAllByText('name')[0]).toBeInTheDocument();
    expect(screen.getByText('dob')).toBeInTheDocument();

    // Second match
    expect(screen.getByText('FBI Most Wanted')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getAllByText('address')[0]).toBeInTheDocument();
  });

  it('should render View Source links when URLs exist', () => {
    render(<AddressWatchlistCard customer={mockCustomerWithMatches} isExpanded={true} />);

    const viewSourceLinks = screen.getAllByText('View Source');
    expect(viewSourceLinks).toHaveLength(3); // 1 for first match, 2 for second match

    // Check that links have correct attributes
    const firstLink = viewSourceLinks[0].closest('a');
    expect(firstLink).toHaveAttribute('href', 'https://sanctionslist.ofac.treas.gov/Details.aspx?id=12345');
    expect(firstLink).toHaveAttribute('target', '_blank');
    expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should not render View Source links when URLs array is empty', () => {
    render(<AddressWatchlistCard customer={mockCustomerNoUrls} isExpanded={true} />);

    expect(screen.getByText('Internal Watchlist')).toBeInTheDocument();
    expect(screen.queryByText('View Source')).not.toBeInTheDocument();
  });

  it('should display matched fields as pills', () => {
    render(<AddressWatchlistCard customer={mockCustomerWithMatches} isExpanded={true} />);

    expect(screen.getAllByText('Matched Fields:')[0]).toBeInTheDocument();

    // Check that matched fields are displayed as pills
    const namePills = screen.getAllByText('name');
    expect(namePills.length).toBeGreaterThan(0);
    expect(namePills[0]).toHaveClass('px-2', 'py-0.5', 'bg-primary/10', 'border', 'border-primary/20');
  });

  it('should display "No watchlist matches found" when clear', () => {
    render(<AddressWatchlistCard customer={mockCustomerClearWatchlist} isExpanded={true} />);

    expect(screen.getByText(/No watchlist matches found/)).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should handle multiple matches with different correlation scores', () => {
    const customerMultipleScores: Customer = {
      ...mockCustomerNoWatchlist,
      review: {
        review_id: 'rev_multi',
        decision: 'review',
        breakdown: {},
        watch_list: {
          decision: 'review',
          codes: ['W01'],
          matches: [
            {
              list_name: 'List A',
              correlation: 'high',
              match_fields: ['name'],
              urls: [],
            },
            {
              list_name: 'List B',
              correlation: 'medium',
              match_fields: ['dob'],
              urls: [],
            },
            {
              list_name: 'List C',
              correlation: 'low',
              match_fields: ['address'],
              urls: [],
            },
          ],
        },
      },
    };

    render(<AddressWatchlistCard customer={customerMultipleScores} isExpanded={true} />);

    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('should handle match without correlation score', () => {
    const customerNoCorrelation: Customer = {
      ...mockCustomerNoWatchlist,
      review: {
        review_id: 'rev_nocorr',
        decision: 'review',
        breakdown: {},
        watch_list: {
          decision: 'review',
          codes: ['W01'],
          matches: [
            {
              list_name: 'Test List',
              correlation: '',
              match_fields: ['name'],
              urls: [],
            },
          ],
        },
      },
    };

    render(<AddressWatchlistCard customer={customerNoCorrelation} isExpanded={true} />);

    expect(screen.getByText('Test List')).toBeInTheDocument();
    expect(screen.getAllByText('name')[0]).toBeInTheDocument();
    // When correlation is empty, the component still renders it but it's an empty string
    // We just verify the component renders without throwing
  });

  it('should handle match without match_fields', () => {
    const customerNoFields: Customer = {
      ...mockCustomerNoWatchlist,
      review: {
        review_id: 'rev_nofields',
        decision: 'review',
        breakdown: {},
        watch_list: {
          decision: 'review',
          codes: ['W01'],
          matches: [
            {
              list_name: 'Test List',
              correlation: 'high',
              match_fields: [],
              urls: [],
            },
          ],
        },
      },
    };

    render(<AddressWatchlistCard customer={customerNoFields} isExpanded={true} />);

    expect(screen.getByText('Test List')).toBeInTheDocument();
    // "Matched Fields:" label should not be rendered when no fields
    expect(screen.queryByText('Matched Fields:')).not.toBeInTheDocument();
  });

  it('should apply correct styling to FLAGGED status', () => {
    render(<AddressWatchlistCard customer={mockCustomerWithMatches} />);

    const flaggedStatus = screen.getByText('FLAGGED');
    expect(flaggedStatus).toHaveClass('text-xs', 'font-pixel', 'text-gold');
  });

  it('should apply correct styling to CLEAR status', () => {
    render(<AddressWatchlistCard customer={mockCustomerClearWatchlist} />);

    const clearStatus = screen.getByText('CLEAR');
    expect(clearStatus).toHaveClass('text-xs', 'font-pixel', 'text-green-500');
  });
});
