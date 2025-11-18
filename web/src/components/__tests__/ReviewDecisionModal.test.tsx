import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewDecisionModal } from '../ReviewDecisionModal';
import * as animations from '@/lib/animations';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/animations');
vi.mock('@/lib/sounds');

describe('ReviewDecisionModal', () => {
  const mockOnClose = vi.fn();
  const mockOnDecision = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Customer Review', () => {
    const customerData = {
      type: 'customer' as const,
      id: 'cust_123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+12125550123',
      status: 'review',
      verificationSummary: {
        email: 'accept',
        phone: 'accept',
        fraud: 'review',
      },
    };

    it('should render customer modal', () => {
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should call onDecision with verified on APPROVE click', async () => {
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      fireEvent.click(screen.getByText('APPROVE'));

      await waitFor(() => {
        expect(mockOnDecision).toHaveBeenCalledWith('verified');
      });
    });

    it('should call onDecision with rejected on REJECT click', async () => {
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      fireEvent.click(screen.getByText('REJECT'));

      await waitFor(() => {
        expect(mockOnDecision).toHaveBeenCalledWith('rejected');
      });
    });

    it('should trigger approve animation on APPROVE', async () => {
      const mockCleanup = vi.fn();
      vi.mocked(animations.triggerApproveAnimation).mockReturnValue(mockCleanup);

      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      fireEvent.click(screen.getByText('APPROVE'));

      await waitFor(() => {
        expect(animations.triggerApproveAnimation).toHaveBeenCalled();
      });
    });

    it('should trigger reject animation on REJECT', async () => {
      const mockCleanup = vi.fn();
      vi.mocked(animations.triggerRejectAnimation).mockReturnValue(mockCleanup);

      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      fireEvent.click(screen.getByText('REJECT'));

      await waitFor(() => {
        expect(animations.triggerRejectAnimation).toHaveBeenCalled();
      });
    });
  });

  describe('Paykey Review', () => {
    const paykeyData = {
      type: 'paykey' as const,
      id: 'paykey_123',
      customerName: 'John Doe',
      institution: 'Chase Bank',
      balance: 1000.0,
      status: 'review',
      verificationSummary: {
        nameMatch: 'accept',
        accountValidation: 'review',
      },
    };

    it('should render paykey modal', () => {
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={paykeyData}
        />
      );

      expect(screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).toBeInTheDocument();
      expect(screen.getByText('Chase Bank')).toBeInTheDocument();
      expect(screen.getByText(/\$1000\.00/)).toBeInTheDocument();
    });

    it('should call onDecision with approved on APPROVE', async () => {
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={paykeyData}
        />
      );

      fireEvent.click(screen.getByText('APPROVE'));

      await waitFor(() => {
        expect(mockOnDecision).toHaveBeenCalledWith('approved');
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should not render when isOpen is false', () => {
      const customerData = {
        type: 'customer' as const,
        id: 'cust_123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+12125550123',
        status: 'review',
      };

      render(
        <ReviewDecisionModal
          isOpen={false}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      expect(screen.queryByText('⚔️ COMPLIANCE CHALLENGE ⚔️')).not.toBeInTheDocument();
    });

    it('should close modal on backdrop click', () => {
      const customerData = {
        type: 'customer' as const,
        id: 'cust_123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+12125550123',
        status: 'review',
      };

      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={mockOnClose}
          onDecision={mockOnDecision}
          data={customerData}
        />
      );

      // Click backdrop (the overlay div)
      const backdrop = screen.getByText('⚔️ COMPLIANCE CHALLENGE ⚔️').closest('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });
});
