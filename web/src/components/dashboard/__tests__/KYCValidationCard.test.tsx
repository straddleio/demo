import { render, screen, fireEvent } from '@testing-library/react';
import { KYCValidationCard } from '../KYCValidationCard';
import { describe, it, expect } from 'vitest';
import type { Customer } from '@/lib/api';

describe('KYCValidationCard', () => {
  const mockCustomerNoKYC: Customer = {
    id: 'cust_123',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+12025551234',
    verification_status: 'verified',
    risk_score: 0.25,
  };

  const mockCustomerKYCPass: Customer = {
    ...mockCustomerNoKYC,
    review: {
      review_id: 'rev_123',
      decision: 'accept',
      breakdown: {},
      kyc: {
        decision: 'accept',
        codes: [],
        validations: {
          address: true,
          city: true,
          state: true,
          zip: true,
          dob: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          ssn: true,
        },
      },
    },
  };

  const mockCustomerKYCFail: Customer = {
    ...mockCustomerNoKYC,
    review: {
      review_id: 'rev_456',
      decision: 'reject',
      breakdown: {},
      kyc: {
        decision: 'reject',
        codes: ['K01'],
        validations: {
          address: false,
          city: false,
          state: false,
          zip: false,
          dob: false,
          email: false,
          first_name: false,
          last_name: false,
          phone: false,
          ssn: false,
        },
      },
    },
  };

  const mockCustomerKYCPartial: Customer = {
    ...mockCustomerNoKYC,
    review: {
      review_id: 'rev_789',
      decision: 'review',
      breakdown: {},
      kyc: {
        decision: 'review',
        codes: [],
        validations: {
          address: true,
          city: true,
          state: true,
          zip: true,
          dob: true,
          email: false,
          first_name: true,
          last_name: true,
          phone: false,
          ssn: false,
        },
      },
    },
  };

  it('should not render when customer has no KYC data', () => {
    const { container } = render(<KYCValidationCard customer={mockCustomerNoKYC} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render with PASS status when decision is accept', () => {
    render(<KYCValidationCard customer={mockCustomerKYCPass} />);

    expect(screen.getByText('KYC')).toBeInTheDocument();
    expect(screen.getByText('PASS')).toBeInTheDocument();
    expect(screen.getByText('PASS')).toHaveClass('text-green-500');
  });

  it('should render with FAIL status when decision is reject', () => {
    render(<KYCValidationCard customer={mockCustomerKYCFail} />);

    expect(screen.getByText('KYC')).toBeInTheDocument();
    expect(screen.getByText('FAIL')).toBeInTheDocument();
    expect(screen.getByText('FAIL')).toHaveClass('text-accent');
  });

  it('should render with REVIEW status when decision is review', () => {
    render(<KYCValidationCard customer={mockCustomerKYCPartial} />);

    expect(screen.getByText('KYC')).toBeInTheDocument();
    expect(screen.getByText('REVIEW')).toBeInTheDocument();
    expect(screen.getByText('REVIEW')).toHaveClass('text-gold');
  });

  it('should toggle expansion when header is clicked', () => {
    render(<KYCValidationCard customer={mockCustomerKYCPass} />);

    // Initially collapsed
    expect(screen.getByText('▶')).toBeInTheDocument();
    expect(screen.queryByText('Validated Fields')).not.toBeInTheDocument();

    // Expand
    fireEvent.click(screen.getByText('KYC'));
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.getByText('Validated Fields')).toBeInTheDocument();

    // Collapse
    fireEvent.click(screen.getByText('KYC'));
    expect(screen.getByText('▶')).toBeInTheDocument();
    expect(screen.queryByText('Validated Fields')).not.toBeInTheDocument();
  });

  it('should respect parent expansion state', () => {
    render(<KYCValidationCard customer={mockCustomerKYCPass} isExpanded={true} />);

    // Should be expanded due to parent state
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.getByText('Validated Fields')).toBeInTheDocument();
  });

  it('should display all validated fields when all pass', () => {
    render(<KYCValidationCard customer={mockCustomerKYCPass} isExpanded={true} />);

    expect(screen.getByText('Validated Fields')).toBeInTheDocument();
    expect(screen.getByText('10/10')).toBeInTheDocument();

    // Check for all field labels
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('ZIP Code')).toBeInTheDocument();
    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('SSN')).toBeInTheDocument();

    // All should have green checkmarks
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks).toHaveLength(10);
  });

  it('should display not validated fields when all fail', () => {
    render(<KYCValidationCard customer={mockCustomerKYCFail} isExpanded={true} />);

    expect(screen.getByText('Not Validated')).toBeInTheDocument();
    expect(screen.getByText('10/10')).toBeInTheDocument();

    // All should have gray X marks
    const xMarks = screen.getAllByText('✗');
    expect(xMarks).toHaveLength(10);
  });

  it('should display both validated and not validated fields for partial validation', () => {
    render(<KYCValidationCard customer={mockCustomerKYCPartial} isExpanded={true} />);

    // Validated section
    expect(screen.getByText('Validated Fields')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();

    // Not validated section
    expect(screen.getByText('Not Validated')).toBeInTheDocument();
    expect(screen.getByText('3/10')).toBeInTheDocument();

    // Check validated fields (7 checkmarks)
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks).toHaveLength(7);

    // Check not validated fields (3 X marks)
    const xMarks = screen.getAllByText('✗');
    expect(xMarks).toHaveLength(3);
  });

  it('should normalize decision to uppercase to handle case mismatch', () => {
    const customerLowercaseDecision: Customer = {
      ...mockCustomerNoKYC,
      review: {
        review_id: 'rev_case',
        decision: 'accept',
        breakdown: {},
        kyc: {
          decision: 'accept', // lowercase from API
          codes: [],
          validations: {
            ssn: true,
          },
        },
      },
    };

    render(<KYCValidationCard customer={customerLowercaseDecision} />);

    // Should still map to PASS
    expect(screen.getByText('PASS')).toBeInTheDocument();
  });

  it('should display correct field labels', () => {
    render(<KYCValidationCard customer={mockCustomerKYCPass} isExpanded={true} />);

    // Verify all friendly labels are displayed
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('ZIP Code')).toBeInTheDocument();
    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('SSN')).toBeInTheDocument();
  });

  it('should apply correct styling to validated fields', () => {
    render(<KYCValidationCard customer={mockCustomerKYCPartial} isExpanded={true} />);

    const checkmarks = screen.getAllByText('✓');
    checkmarks.forEach((checkmark) => {
      expect(checkmark).toHaveClass('text-green-500');
    });
  });

  it('should apply correct styling to not validated fields', () => {
    render(<KYCValidationCard customer={mockCustomerKYCPartial} isExpanded={true} />);

    const xMarks = screen.getAllByText('✗');
    xMarks.forEach((xMark) => {
      expect(xMark).toHaveClass('text-neutral-600');
    });
  });

  it('should handle empty validations object', () => {
    const customerEmptyValidations: Customer = {
      ...mockCustomerNoKYC,
      review: {
        review_id: 'rev_empty',
        decision: 'review',
        breakdown: {},
        kyc: {
          decision: 'review',
          codes: [],
          validations: {},
        },
      },
    };

    render(<KYCValidationCard customer={customerEmptyValidations} isExpanded={true} />);

    // Should show 0 validated, 10 not validated
    expect(screen.getByText('Not Validated')).toBeInTheDocument();
    expect(screen.getByText('10/10')).toBeInTheDocument();

    // All 10 fields should have X marks
    const xMarks = screen.getAllByText('✗');
    expect(xMarks).toHaveLength(10);
  });

  it('should handle undefined decision gracefully', () => {
    const customerNoDecision: Customer = {
      ...mockCustomerNoKYC,
      review: {
        review_id: 'rev_nodec',
        decision: 'review',
        breakdown: {},
        kyc: {
          decision: '',
          codes: [],
          validations: {
            ssn: true,
          },
        },
      },
    };

    render(<KYCValidationCard customer={customerNoDecision} />);

    // Empty decision should map to FAIL
    expect(screen.getByText('FAIL')).toBeInTheDocument();
  });

  it('should display counts in pixel font', () => {
    render(<KYCValidationCard customer={mockCustomerKYCPartial} isExpanded={true} />);

    const validatedCount = screen.getByText('7/10');
    expect(validatedCount).toHaveClass('font-pixel');

    const notValidatedCount = screen.getByText('3/10');
    expect(notValidatedCount).toHaveClass('font-pixel');
  });

  it('should use 2-column grid layout for fields', () => {
    const { container } = render(<KYCValidationCard customer={mockCustomerKYCPass} isExpanded={true} />);

    const grids = container.querySelectorAll('.grid.grid-cols-2');
    expect(grids.length).toBeGreaterThan(0);
  });
});
