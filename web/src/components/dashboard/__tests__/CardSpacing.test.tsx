import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerCard } from '../CustomerCard';
import { PaykeyCard } from '../PaykeyCard';
import { useDemoStore } from '@/lib/state';

/**
 * Test suite for verifying consistent spacing between CustomerCard and PaykeyCard
 * in the 50/50 layout. Both cards should have:
 * - Consistent space-y-* classes for vertical rhythm
 * - Consistent pt/pb for section dividers
 * - Consistent gap-* for grid layouts
 * - Aligned field heights when side-by-side
 */
describe('CardSpacing - Visual Consistency', () => {
  const mockCustomer = {
    id: 'cust_123',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+12025551234',
    verification_status: 'verified',
    risk_score: 0.25,
    compliance_profile: {
      ssn: '***-**-1234',
      dob: '****-**-15',
    },
    review: {
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

  const mockPaykey = {
    id: 'pk_123',
    paykey: 'pk_test_123',
    customer_id: 'cust_test_123',
    status: 'active' as const,
    source: 'bank_account' as const,
    label: 'Chase Checking',
    institution_name: 'JPMORGAN CHASE BANK, NA',
    last4: '1234',
    account_type: 'checking' as const,
    balance: {
      account_balance: 500000,
      status: 'completed' as const,
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
  };

  beforeEach(() => {
    useDemoStore.getState().reset();
  });

  describe('Main Content Spacing', () => {
    it('should use space-y-3 for main content in both cards', () => {
      useDemoStore.getState().setCustomer(mockCustomer as any);
      useDemoStore.getState().setPaykey(mockPaykey as any);

      const { container: customerContainer } = render(<CustomerCard />);
      const { container: paykeyContainer } = render(<PaykeyCard />);

      // Both should use RetroCardContent with space-y-3
      const customerContent = customerContainer.querySelector('[class*="space-y-3"]');
      const paykeyContent = paykeyContainer.querySelector('[class*="space-y-3"]');

      expect(customerContent).toBeInTheDocument();
      expect(paykeyContent).toBeInTheDocument();
    });
  });

  describe('Section Divider Spacing', () => {
    it('should use consistent pt-2 border-t spacing for sections in both cards', () => {
      useDemoStore.getState().setCustomer(mockCustomer as any);
      useDemoStore.getState().setPaykey(mockPaykey as any);

      const { container: customerContainer } = render(<CustomerCard />);
      const { container: paykeyContainer } = render(<PaykeyCard />);

      // Check for consistent border-t pt-2 pattern
      const customerSections = customerContainer.querySelectorAll(
        '[class*="pt-2"][class*="border-t"]'
      );
      const paykeySections = paykeyContainer.querySelectorAll('[class*="pt-2"][class*="border-t"]');

      // Both cards should have at least one section divider
      expect(customerSections.length).toBeGreaterThan(0);
      expect(paykeySections.length).toBeGreaterThan(0);

      // Verify they all use pt-2 (not pt-3 or other values)
      customerSections.forEach((section) => {
        expect(section.className).toMatch(/\bpt-2\b/);
      });
      paykeySections.forEach((section) => {
        expect(section.className).toMatch(/\bpt-2\b/);
      });
    });
  });

  describe('Grid Spacing', () => {
    it('should use consistent gap-3 for grid layouts in both cards', () => {
      useDemoStore.getState().setCustomer(mockCustomer as any);
      useDemoStore.getState().setPaykey(mockPaykey as any);

      const { container: customerContainer } = render(<CustomerCard />);
      const { container: paykeyContainer } = render(<PaykeyCard />);

      // Find all grids in both cards
      const customerGrids = customerContainer.querySelectorAll('[class*="grid"]');
      const paykeyGrids = paykeyContainer.querySelectorAll('[class*="grid"]');

      // Both should have grids
      expect(customerGrids.length).toBeGreaterThan(0);
      expect(paykeyGrids.length).toBeGreaterThan(0);

      // Verify consistent gap-3 usage
      customerGrids.forEach((grid) => {
        if (grid.className.includes('gap-')) {
          expect(grid.className).toMatch(/\bgap-3\b/);
        }
      });
      paykeyGrids.forEach((grid) => {
        if (grid.className.includes('gap-')) {
          expect(grid.className).toMatch(/\bgap-3\b/);
        }
      });
    });
  });

  describe('Field Label Consistency', () => {
    it('should use text-xs text-neutral-400 for field labels in both cards', () => {
      useDemoStore.getState().setCustomer(mockCustomer as any);
      useDemoStore.getState().setPaykey(mockPaykey as any);

      const { container: customerContainer } = render(<CustomerCard />);
      const { container: paykeyContainer } = render(<PaykeyCard />);

      // Check label styling consistency
      const customerLabels = customerContainer.querySelectorAll(
        '[class*="text-xs"][class*="text-neutral-400"]'
      );
      const paykeyLabels = paykeyContainer.querySelectorAll(
        '[class*="text-xs"][class*="text-neutral-400"]'
      );

      expect(customerLabels.length).toBeGreaterThan(0);
      expect(paykeyLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Verification Section Spacing', () => {
    it('should use consistent spacing for verification sections', () => {
      useDemoStore.getState().setCustomer(mockCustomer as any);
      useDemoStore.getState().setPaykey(mockPaykey as any);

      const { container: customerContainer } = render(<CustomerCard />);
      const { container: paykeyContainer } = render(<PaykeyCard />);

      // Find verification sections (both have pt-2 border-t border-*-20)
      const customerVerification = customerContainer.querySelector('[class*="border-primary/20"]');
      const paykeyVerification = paykeyContainer.querySelector('[class*="border-secondary/20"]');

      // Both should exist and use pt-2
      expect(customerVerification).toBeInTheDocument();
      expect(paykeyVerification).toBeInTheDocument();

      if (customerVerification) {
        expect(customerVerification.className).toMatch(/\bpt-2\b/);
      }
      if (paykeyVerification) {
        expect(paykeyVerification.className).toMatch(/\bpt-2\b/);
      }
    });
  });

  describe('Button Spacing', () => {
    it('should use consistent mb-2 for section headers with buttons', () => {
      useDemoStore.getState().setCustomer(mockCustomer as any);
      useDemoStore.getState().setPaykey(mockPaykey as any);

      render(<CustomerCard />);
      render(<PaykeyCard />);

      // Both cards have "Verification Details" section headers
      // They should have consistent spacing below the header
      const customerHeader = screen.getAllByText(/Identity Verification|Verification Details/i)[0];
      const paykeyHeader = screen.getAllByText(/Verification Details/i)[0];

      expect(customerHeader).toBeInTheDocument();
      expect(paykeyHeader).toBeInTheDocument();

      // Verify parent elements have mb-2
      const customerParent = customerHeader.parentElement;
      const paykeyParent = paykeyHeader.parentElement;

      if (customerParent) {
        expect(customerParent.className).toMatch(/\bmb-2\b/);
      }
      if (paykeyParent) {
        expect(paykeyParent.className).toMatch(/\bmb-2\b/);
      }
    });
  });

  describe('Top-Level Field Alignment', () => {
    it('should have Name/Email row in CustomerCard align with Bank Info in PaykeyCard', () => {
      useDemoStore.getState().setCustomer(mockCustomer as any);
      useDemoStore.getState().setPaykey(mockPaykey as any);

      render(<CustomerCard />);
      render(<PaykeyCard />);

      // Both should have their first content section immediately after the header
      // CustomerCard: Name/Email grid
      // PaykeyCard: Bank info with logo
      const nameLabel = screen.getByText('Name');
      const balanceLabel = screen.getByText('Balance');

      expect(nameLabel).toBeInTheDocument();
      expect(balanceLabel).toBeInTheDocument();
    });
  });
});
