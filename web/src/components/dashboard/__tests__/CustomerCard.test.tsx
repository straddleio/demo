import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerCard } from '../CustomerCard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDemoStore } from '@/lib/state';
import * as api from '@/lib/api';

// Mock the Zustand store
vi.mock('@/lib/state', () => {
  const mockAddAPILogEntry = vi.fn();
  const mockAddTerminalLine = vi.fn();

  return {
    useDemoStore: Object.assign(
      vi.fn((selector: ((state: unknown) => unknown) | undefined) => {
        const mockState = {
          customer: null,
        };
        if (!selector) {
          return mockState;
        }
        return selector(mockState);
      }),
      {
        getState: vi.fn(() => ({
          addAPILogEntry: mockAddAPILogEntry,
          addTerminalLine: mockAddTerminalLine,
        })),
      }
    ),
  };
});

// Mock the geolocation hook
vi.mock('@/lib/useGeolocation', () => ({
  useGeolocation: vi.fn(() => ({
    loading: false,
    error: null,
    city: 'New York',
    countryCode: 'US',
  })),
}));

// Mock the API module
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    unmaskCustomer: vi.fn(),
  };
});

describe('CustomerCard - SSN Display Logic', () => {
  const mockCustomer = {
    id: 'cust_123',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+12025551234',
    verification_status: 'verified',
    risk_score: 0.25,
    compliance_profile: {
      ssn: '***-**-1234', // Already masked by API
      dob: '****-**-15',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default store state
    (useDemoStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: { customer: typeof mockCustomer }) => unknown) => {
        const state = {
          customer: mockCustomer,
        };
        return selector(state);
      }
    );
  });

  it('should display masked SSN from API without manual formatting', () => {
    render(<CustomerCard />);

    // Find the SSN value
    const ssnLabel = screen.getByText('SSN');
    const ssnValue = ssnLabel.nextElementSibling;

    // Should display the masked SSN as-is from the API
    expect(ssnValue?.textContent).toBe('***-**-1234');
  });

  it('should display unmasked SSN when unmask button is clicked', async () => {
    const mockUnmaskedData = {
      id: 'cust_123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+12025551234',
      verification_status: 'verified',
      compliance_profile: {
        ssn: '123-45-1234', // Unmasked
        dob: '1990-01-15',
      },
    };

    vi.spyOn(api, 'unmaskCustomer').mockResolvedValue(mockUnmaskedData);

    render(<CustomerCard />);

    // Initially shows masked
    const ssnLabel = screen.getByText('SSN');
    let ssnValue = ssnLabel.nextElementSibling;
    expect(ssnValue?.textContent).toBe('***-**-1234');

    // Click unmask button
    const showButton = screen.getByTitle('Show unmasked data');
    fireEvent.click(showButton);

    // Wait for unmasked data to load
    await waitFor(() => {
      ssnValue = ssnLabel.nextElementSibling;
      expect(ssnValue?.textContent).toBe('123-45-1234');
    });

    // Button should now say "HIDE"
    expect(screen.getByTitle('Hide sensitive data')).toBeInTheDocument();
  });

  it('should toggle between masked and unmasked states', async () => {
    const mockUnmaskedData = {
      id: 'cust_123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+12025551234',
      verification_status: 'verified',
      compliance_profile: {
        ssn: '123-45-1234',
        dob: '1990-01-15',
      },
    };

    vi.spyOn(api, 'unmaskCustomer').mockResolvedValue(mockUnmaskedData);

    render(<CustomerCard />);

    const ssnLabel = screen.getByText('SSN');

    // Initially masked
    let ssnValue = ssnLabel.nextElementSibling;
    expect(ssnValue?.textContent).toBe('***-**-1234');

    // Unmask
    fireEvent.click(screen.getByTitle('Show unmasked data'));
    await waitFor(() => {
      ssnValue = ssnLabel.nextElementSibling;
      expect(ssnValue?.textContent).toBe('123-45-1234');
    });

    // Hide again
    fireEvent.click(screen.getByTitle('Hide sensitive data'));
    ssnValue = ssnLabel.nextElementSibling;
    expect(ssnValue?.textContent).toBe('***-**-1234');
  });

  it('should match DOB display pattern for consistency', () => {
    render(<CustomerCard />);

    const ssnLabel = screen.getByText('SSN');
    const dobLabel = screen.getByText('Date of Birth');

    const ssnValue = ssnLabel.nextElementSibling;
    const dobValue = dobLabel.nextElementSibling;

    // Both should display masked values from API directly
    expect(ssnValue?.textContent).toBe('***-**-1234');
    expect(dobValue?.textContent).toBe('****-**-15');
  });

  it('should not manually format SSN when API already provides masked format', () => {
    // This test specifically verifies that we don't do manual string slicing
    // The API returns: '***-**-1234' (already masked)
    // Current buggy code does: `***-**-${customer.compliance_profile.ssn.slice(-4)}`
    // Which would slice the last 4 chars from '***-**-1234' giving '1234'
    // Then format it as '***-**-1234' - which happens to work by accident!

    // But if the API format ever changes, this would break.
    // Let's test with a different masked format to expose the issue
    const customMaskedCustomer = {
      ...mockCustomer,
      compliance_profile: {
        ssn: 'XXX-XX-1234', // Different mask format
        dob: '****-**-15',
      },
    };

    (useDemoStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: { customer: typeof customMaskedCustomer }) => unknown) => {
        const state = {
          customer: customMaskedCustomer,
        };
        return selector(state);
      }
    );

    render(<CustomerCard />);

    const ssnLabel = screen.getByText('SSN');
    const ssnValue = ssnLabel.nextElementSibling;

    // Should display exactly what the API returned, not manually format it
    // Current buggy code would display: '***-**-1234' (manually formatted)
    // Correct code should display: 'XXX-XX-1234' (from API)
    expect(ssnValue?.textContent).toBe('XXX-XX-1234');
  });

  it('should display error message when unmask fails', async () => {
    const errorMessage = 'Failed to unmask customer data';
    vi.spyOn(api, 'unmaskCustomer').mockRejectedValue(new Error(errorMessage));

    render(<CustomerCard />);

    // Click unmask button
    const showButton = screen.getByTitle('Show unmasked data');
    fireEvent.click(showButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Error should be displayed in red/accent color
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toHaveClass('text-accent');
  });

  it('should clear error on successful unmask', async () => {
    const mockUnmaskedData = {
      id: 'cust_123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+12025551234',
      verification_status: 'verified',
      compliance_profile: {
        ssn: '123-45-1234',
        dob: '1990-01-15',
      },
    };

    // First attempt fails
    vi.spyOn(api, 'unmaskCustomer').mockRejectedValueOnce(
      new Error('Failed to unmask customer data')
    );

    render(<CustomerCard />);

    // Click unmask button - first attempt fails
    const showButton = screen.getByTitle('Show unmasked data');
    fireEvent.click(showButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to unmask customer data')).toBeInTheDocument();
    });

    // Second attempt succeeds
    vi.spyOn(api, 'unmaskCustomer').mockResolvedValueOnce(mockUnmaskedData);
    fireEvent.click(showButton);

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Failed to unmask customer data')).not.toBeInTheDocument();
    });

    // Unmasked data should be displayed
    const ssnLabel = screen.getByText('SSN');
    const ssnValue = ssnLabel.nextElementSibling;
    expect(ssnValue?.textContent).toBe('123-45-1234');
  });

  it('should clear error when hiding unmasked data', async () => {
    const mockUnmaskedData = {
      id: 'cust_123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+12025551234',
      verification_status: 'verified',
      compliance_profile: {
        ssn: '123-45-1234',
        dob: '1990-01-15',
      },
    };

    // First unmask fails
    vi.spyOn(api, 'unmaskCustomer').mockRejectedValueOnce(
      new Error('Failed to unmask customer data')
    );

    render(<CustomerCard />);

    const showButton = screen.getByTitle('Show unmasked data');
    fireEvent.click(showButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Failed to unmask customer data')).toBeInTheDocument();
    });

    // Second unmask succeeds
    vi.spyOn(api, 'unmaskCustomer').mockResolvedValueOnce(mockUnmaskedData);
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.queryByText('Failed to unmask customer data')).not.toBeInTheDocument();
    });

    // Now hide the data
    const hideButton = screen.getByTitle('Hide sensitive data');
    fireEvent.click(hideButton);

    // Error should remain cleared
    expect(screen.queryByText('Failed to unmask customer data')).not.toBeInTheDocument();
  });

  it('should handle non-Error objects in catch block', async () => {
    // Test with a string thrown instead of an Error object
    vi.spyOn(api, 'unmaskCustomer').mockRejectedValue('Network error');

    render(<CustomerCard />);

    const showButton = screen.getByTitle('Show unmasked data');
    fireEvent.click(showButton);

    // Should display a generic error message
    await waitFor(() => {
      expect(screen.getByText('Failed to unmask customer data')).toBeInTheDocument();
    });
  });
});

describe('CustomerCard - Review Modal Integration', () => {
  const mockCustomer = {
    id: 'cust_123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+12125550123',
    verification_status: 'review',
    risk_score: 0.25,
    compliance_profile: {
      ssn: '***-**-1234',
      dob: '****-**-15',
    },
    review: {
      review_id: 'rev_123',
      decision: 'review',
      breakdown: {
        email: {
          decision: 'accept',
          risk_score: 0.1,
        },
        phone: {
          decision: 'accept',
          risk_score: 0.1,
        },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Update the mock selector to return the mockCustomer
    (useDemoStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: ((state: { customer: typeof mockCustomer }) => unknown) | undefined) => {
        const state = {
          customer: mockCustomer,
        };
        if (!selector) {
          return state;
        }
        return selector(state);
      }
    );
  });

  it('should open modal when review button clicked', () => {
    render(<CustomerCard />);

    // Modal should not be visible initially
    expect(screen.queryByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).not.toBeInTheDocument();

    // Click review button
    const reviewButton = screen.getByText('REVIEW');
    fireEvent.click(reviewButton);

    // Modal should appear
    expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
  });

  it('should call API on approve', async () => {
    const mockCustomerReviewDecision = vi.fn().mockResolvedValue({
      id: 'cust_123',
      status: 'verified',
    });

    vi.spyOn(api, 'customerReviewDecision').mockImplementation(mockCustomerReviewDecision);

    render(<CustomerCard />);

    // Open modal
    fireEvent.click(screen.getByText('REVIEW'));

    // Click approve
    fireEvent.click(screen.getByText('APPROVE'));

    await waitFor(() => {
      expect(mockCustomerReviewDecision).toHaveBeenCalledWith('cust_123', 'verified');
    });
  });

  it('should call API on reject', async () => {
    const mockCustomerReviewDecision = vi.fn().mockResolvedValue({
      id: 'cust_123',
      status: 'rejected',
    });

    vi.spyOn(api, 'customerReviewDecision').mockImplementation(mockCustomerReviewDecision);

    render(<CustomerCard />);

    // Open modal
    fireEvent.click(screen.getByText('REVIEW'));

    // Click reject
    fireEvent.click(screen.getByText('REJECT'));

    await waitFor(() => {
      expect(mockCustomerReviewDecision).toHaveBeenCalledWith('cust_123', 'rejected');
    });
  });
});
