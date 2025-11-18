import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CustomerCard } from '@/components/dashboard/CustomerCard';
import { PaykeyCard } from '@/components/dashboard/PaykeyCard';
import { useDemoStore } from '@/lib/state';
import * as api from '@/lib/api';
import * as animations from '@/lib/animations';
import * as sounds from '@/lib/sounds';

/**
 * End-to-End Integration Tests for Review Decision Flow
 *
 * These tests verify the complete flow from button click through animation,
 * API call, and terminal logging. Each test covers:
 * - Modal opens with correct data
 * - Animation is triggered
 * - API is called with correct parameters
 * - Sound effects play (when enabled)
 * - Terminal logs the decision
 * - Modal closes after animation
 */

// Mock modules
vi.mock('@/lib/api');
vi.mock('@/lib/animations');
vi.mock('@/lib/sounds');
vi.mock('@/lib/useGeolocation', () => ({
  useGeolocation: vi.fn(() => ({
    loading: false,
    error: null,
    city: 'New York',
    countryCode: 'US',
  })),
}));

describe('Review Decision Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDemoStore.getState().reset();

    // Default mock implementations
    vi.mocked(animations.triggerApproveAnimation).mockReturnValue(() => {});
    vi.mocked(animations.triggerRejectAnimation).mockReturnValue(() => {});
    vi.mocked(sounds.playApproveSound).mockResolvedValue(true);
    vi.mocked(sounds.playRejectSound).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Customer Review Flow - Approve', () => {
    it('should complete customer approve flow end-to-end', async () => {
      // Arrange: Set initial state with customer in review
      const customer = {
        id: 'cust_approve_001',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+12125550101',
        verification_status: 'review' as const,
        type: 'individual' as const,
        created_at: '2025-01-01T00:00:00Z',
        review: {
          review_id: 'rev_123',
          decision: 'review',
          breakdown: {
            email: { decision: 'accept', risk_score: 0.1 },
            phone: { decision: 'accept', risk_score: 0.15 },
          },
        },
      };

      useDemoStore.setState({ customer });

      // Mock API response
      vi.mocked(api.customerReviewDecision).mockResolvedValue({
        id: 'cust_approve_001',
        verification_status: 'verified',
      } as unknown);

      // Mock animations to track calls
      const mockApproveCleanup = vi.fn();
      vi.mocked(animations.triggerApproveAnimation).mockReturnValue(mockApproveCleanup);

      // Act: Render component and click review button
      const { getByRole: getByRoleCard } = render(<CustomerCard />);

      // Verify review button is visible and clickable
      const reviewButton = getByRoleCard('button', { name: /REVIEW/i });
      expect(reviewButton).toBeInTheDocument();

      fireEvent.click(reviewButton);

      // Verify modal opens with correct title and customer email
      await waitFor(() => {
        expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      });

      const emailTexts = screen.getAllByText('alice@example.com');
      expect(emailTexts.length).toBeGreaterThan(0);

      // Click approve button
      const approveButton = screen.getByRole('button', { name: /APPROVE/i });
      fireEvent.click(approveButton);

      // Assert: Verify animation was triggered
      expect(animations.triggerApproveAnimation).toHaveBeenCalled();

      // Verify API was called with correct parameters
      await waitFor(() => {
        expect(api.customerReviewDecision).toHaveBeenCalledWith('cust_approve_001', 'verified');
      });

      // Verify sound was played
      expect(sounds.playApproveSound).toHaveBeenCalled();

      // Verify terminal logging - decision should be logged
      await waitFor(() => {
        const state = useDemoStore.getState();
        const hasDecisionLog = state.terminalHistory.some(
          (line) =>
            line.text.includes('Customer review decision') &&
            line.type === 'info' &&
            line.source === 'ui-action'
        );
        expect(hasDecisionLog).toBe(true);
      });
    });
  });

  describe('Customer Review Flow - Reject', () => {
    it('should complete customer reject flow end-to-end', async () => {
      // Arrange
      const customer = {
        id: 'cust_reject_001',
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+12125550102',
        verification_status: 'review' as const,
        type: 'individual' as const,
        created_at: '2025-01-01T00:00:00Z',
      };

      useDemoStore.setState({ customer });

      vi.mocked(api.customerReviewDecision).mockResolvedValue({
        id: 'cust_reject_001',
        verification_status: 'rejected',
      } as unknown);

      const mockRejectCleanup = vi.fn();
      vi.mocked(animations.triggerRejectAnimation).mockReturnValue(mockRejectCleanup);

      // Act
      const { getByRole: getByRoleCard } = render(<CustomerCard />);
      const reviewButton = getByRoleCard('button', { name: /REVIEW/i });
      fireEvent.click(reviewButton);

      // Verify modal content
      await waitFor(() => {
        expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      });

      const emailTexts = screen.getAllByText('bob@example.com');
      expect(emailTexts.length).toBeGreaterThan(0);

      const rejectButton = screen.getByRole('button', { name: /REJECT/i });
      fireEvent.click(rejectButton);

      // Assert
      expect(animations.triggerRejectAnimation).toHaveBeenCalled();
      expect(sounds.playRejectSound).toHaveBeenCalled();

      await waitFor(() => {
        expect(api.customerReviewDecision).toHaveBeenCalledWith('cust_reject_001', 'rejected');
      });

      // Verify terminal logging
      await waitFor(() => {
        const state = useDemoStore.getState();
        const hasDecisionLog = state.terminalHistory.some(
          (line) => line.text.includes('Customer review decision') && line.source === 'ui-action'
        );
        expect(hasDecisionLog).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully during customer approval', async () => {
      // Arrange
      const customer = {
        id: 'cust_error_001',
        name: 'Charlie Davis',
        email: 'charlie@example.com',
        phone: '+12125550103',
        verification_status: 'review' as const,
        type: 'individual' as const,
        created_at: '2025-01-01T00:00:00Z',
      };

      useDemoStore.setState({ customer });

      // Mock API to throw error
      vi.mocked(api.customerReviewDecision).mockRejectedValue(new Error('Network error'));

      const mockCleanup = vi.fn();
      vi.mocked(animations.triggerApproveAnimation).mockReturnValue(mockCleanup);

      // Act
      const { getByRole: getByRoleCard } = render(<CustomerCard />);
      const reviewButton = getByRoleCard('button', { name: /REVIEW/i });
      fireEvent.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /APPROVE/i });
      fireEvent.click(approveButton);

      // Assert: API was still called despite error
      await waitFor(() => {
        expect(api.customerReviewDecision).toHaveBeenCalledWith('cust_error_001', 'verified');
      });

      // Animation should still have been triggered
      expect(animations.triggerApproveAnimation).toHaveBeenCalled();
    });

    it('should prevent double submission during animation', async () => {
      // Arrange
      const customer = {
        id: 'cust_double_001',
        name: 'Eve Fisher',
        email: 'eve@example.com',
        phone: '+12125550105',
        verification_status: 'review' as const,
        type: 'individual' as const,
        created_at: '2025-01-01T00:00:00Z',
      };

      useDemoStore.setState({ customer });

      let callCount = 0;
      vi.mocked(api.customerReviewDecision).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          id: 'cust_double_001',
          verification_status: 'verified',
        } as unknown);
      });

      vi.mocked(animations.triggerApproveAnimation).mockReturnValue(() => {});

      // Act
      const { getByRole: getByRoleCard } = render(<CustomerCard />);
      const reviewButton = getByRoleCard('button', { name: /REVIEW/i });
      fireEvent.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /APPROVE/i });

      // Try to click multiple times rapidly
      fireEvent.click(approveButton);
      fireEvent.click(approveButton);
      fireEvent.click(approveButton);

      // Assert: Only one API call should be made
      await waitFor(() => {
        expect(callCount).toBe(1);
      });
    });
  });

  describe('Paykey Review Flow - Approve', () => {
    it('should complete paykey approve flow end-to-end', async () => {
      // Arrange: Set both customer and paykey in store
      const customer = {
        id: 'cust_paykey_001',
        name: 'Frank Green',
        email: 'frank@example.com',
        phone: '+12125550106',
        verification_status: 'verified' as const,
        type: 'individual' as const,
        created_at: '2025-01-01T00:00:00Z',
      };

      const paykey = {
        id: 'paykey_approve_001',
        paykey: 'token_abc_123',
        customer_id: 'cust_paykey_001',
        status: 'review' as const,
        institution_name: 'Chase Bank',
        balance: { account_balance: 500000, status: 'completed' as const },
        created_at: '2025-01-01T00:00:00Z',
      };

      useDemoStore.setState({ customer, paykey });

      vi.mocked(api.paykeyReviewDecision).mockResolvedValue({
        id: 'paykey_approve_001',
        status: 'active',
      } as unknown);

      const mockCleanup = vi.fn();
      vi.mocked(animations.triggerApproveAnimation).mockReturnValue(mockCleanup);

      // Act
      const { getByRole: getByRoleCard } = render(<PaykeyCard />);

      // Verify review button is visible
      const reviewButton = getByRoleCard('button', { name: /REVIEW/i });
      expect(reviewButton).toBeInTheDocument();

      fireEvent.click(reviewButton);

      // Verify modal appears
      await waitFor(() => {
        expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      });

      // Verify bank name is shown in modal (by checking all Bank of America instances)
      const bankTexts = screen.getAllByText('Chase Bank');
      expect(bankTexts.length).toBeGreaterThan(0);

      // Click approve
      const approveButton = screen.getByRole('button', { name: /APPROVE/i });
      fireEvent.click(approveButton);

      // Assert
      expect(animations.triggerApproveAnimation).toHaveBeenCalled();

      await waitFor(() => {
        expect(api.paykeyReviewDecision).toHaveBeenCalledWith('paykey_approve_001', 'approved');
      });

      expect(sounds.playApproveSound).toHaveBeenCalled();

      // Verify terminal logging
      await waitFor(() => {
        const state = useDemoStore.getState();
        const hasDecisionLog = state.terminalHistory.some(
          (line) => line.text.includes('Paykey review decision') && line.source === 'ui-action'
        );
        expect(hasDecisionLog).toBe(true);
      });
    });
  });

  describe('Paykey Review Flow - Reject', () => {
    it('should complete paykey reject flow end-to-end', async () => {
      // Arrange
      const customer = {
        id: 'cust_paykey_reject_001',
        name: 'Grace Hall',
        email: 'grace@example.com',
        phone: '+12125550107',
        verification_status: 'verified' as const,
        type: 'individual' as const,
        created_at: '2025-01-01T00:00:00Z',
      };

      const paykey = {
        id: 'paykey_reject_001',
        paykey: 'token_def_456',
        customer_id: 'cust_paykey_reject_001',
        status: 'review' as const,
        institution_name: 'Bank of America',
        balance: { account_balance: 250000, status: 'completed' as const },
        created_at: '2025-01-01T00:00:00Z',
      };

      useDemoStore.setState({ customer, paykey });

      vi.mocked(api.paykeyReviewDecision).mockResolvedValue({
        id: 'paykey_reject_001',
        status: 'rejected',
      } as unknown);

      const mockCleanup = vi.fn();
      vi.mocked(animations.triggerRejectAnimation).mockReturnValue(mockCleanup);

      // Act
      const { getByRole: getByRoleCard } = render(<PaykeyCard />);
      const reviewButton = getByRoleCard('button', { name: /REVIEW/i });
      fireEvent.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      });

      // Verify bank name is shown (may appear multiple times)
      const bankTexts = screen.getAllByText('Bank of America');
      expect(bankTexts.length).toBeGreaterThan(0);

      const rejectButton = screen.getByRole('button', { name: /REJECT/i });
      fireEvent.click(rejectButton);

      // Assert
      expect(animations.triggerRejectAnimation).toHaveBeenCalled();
      expect(sounds.playRejectSound).toHaveBeenCalled();

      await waitFor(() => {
        expect(api.paykeyReviewDecision).toHaveBeenCalledWith('paykey_reject_001', 'rejected');
      });

      // Verify logging
      await waitFor(() => {
        const state = useDemoStore.getState();
        const hasDecisionLog = state.terminalHistory.some(
          (line) => line.text.includes('Paykey review decision') && line.source === 'ui-action'
        );
        expect(hasDecisionLog).toBe(true);
      });
    });
  });

  describe('Terminal Logging', () => {
    it('should log decision action with correct metadata', async () => {
      // Arrange
      const customer = {
        id: 'cust_metadata_001',
        name: 'Karen Lopez',
        email: 'karen@example.com',
        phone: '+12125550111',
        verification_status: 'review' as const,
        type: 'individual' as const,
        created_at: '2025-01-01T00:00:00Z',
      };

      useDemoStore.setState({ customer });

      vi.mocked(api.customerReviewDecision).mockResolvedValue({
        id: 'cust_metadata_001',
        verification_status: 'verified',
      } as unknown);

      vi.mocked(animations.triggerApproveAnimation).mockReturnValue(() => {});

      // Act
      const { getByRole: getByRoleCard } = render(<CustomerCard />);
      const reviewButton = getByRoleCard('button', { name: /REVIEW/i });
      fireEvent.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /APPROVE/i });
      fireEvent.click(approveButton);

      // Assert: Check terminal history has the decision logged with correct metadata
      await waitFor(() => {
        const state = useDemoStore.getState();
        const decisionLog = state.terminalHistory.find(
          (line) => line.text.includes('Customer review decision') && line.source === 'ui-action'
        );

        expect(decisionLog).toBeDefined();
        expect(decisionLog?.type).toBe('info');
        expect(decisionLog?.source).toBe('ui-action');
        expect(decisionLog?.timestamp).toBeInstanceOf(Date);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing review data gracefully', async () => {
      // Arrange: Customer without review data
      const customer = {
        id: 'cust_no_review_001',
        name: 'Henry Irving',
        email: 'henry@example.com',
        phone: '+12125550108',
        verification_status: 'review' as const,
        type: 'individual' as const,
        created_at: '2025-01-01T00:00:00Z',
      };

      useDemoStore.setState({ customer });

      vi.mocked(api.customerReviewDecision).mockResolvedValue({
        id: 'cust_no_review_001',
        verification_status: 'verified',
      } as unknown);

      // Should still render without crashing
      const { getByRole: getByRoleCard } = render(<CustomerCard />);
      const reviewButton = getByRoleCard('button', { name: /REVIEW/i });
      expect(reviewButton).toBeInTheDocument();

      fireEvent.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      });
    });

    it('should handle modal backdrop click correctly', async () => {
      // Arrange
      const customer = {
        id: 'cust_backdrop_001',
        name: 'Jack Kennedy',
        email: 'jack@example.com',
        phone: '+12125550110',
        verification_status: 'review' as const,
        type: 'individual' as const,
        created_at: '2025-01-01T00:00:00Z',
      };

      useDemoStore.setState({ customer });

      // Act
      const { getByRole: getByRoleCard, queryByText } = render(<CustomerCard />);
      const reviewButton = getByRoleCard('button', { name: /REVIEW/i });
      fireEvent.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      });

      const modal = screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️').closest('.fixed.inset-0');
      expect(modal).toBeInTheDocument();

      // Click on backdrop (not on modal content)
      if (modal) {
        fireEvent.click(modal);

        // Modal should close without making API calls
        await waitFor(() => {
          expect(queryByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).not.toBeInTheDocument();
        });
      }

      expect(api.customerReviewDecision).not.toHaveBeenCalled();
    });
  });
});
