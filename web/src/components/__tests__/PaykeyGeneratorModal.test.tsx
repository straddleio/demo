import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaykeyGeneratorModal } from '../PaykeyGeneratorModal';
import { useDemoStore } from '../../lib/state';

// Mock the canvas and dependencies
vi.mock('../generator/v5-arcade/ArcadeCanvas', () => ({
  ArcadeCanvas: ({ onComplete }: any) => (
    <div data-testid="arcade-canvas">
      <button onClick={onComplete} data-testid="complete-btn">
        Complete
      </button>
    </div>
  ),
}));

describe('PaykeyGeneratorModal', () => {
  const mockClearGeneratorData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useDemoStore.setState({
      showPaykeyGenerator: false,
      generatorData: null,
      clearGeneratorData: mockClearGeneratorData,
    });
  });

  it('should not render when showPaykeyGenerator is false', () => {
    useDemoStore.setState({
      showPaykeyGenerator: false,
      generatorData: { customerName: 'Test', paykeyToken: '', accountLast4: '', routingNumber: '' },
    });
    render(<PaykeyGeneratorModal />);
    expect(screen.queryByText(/PAYKEY GENERATOR/)).not.toBeInTheDocument();
  });

  it('should render arcade modal when active', () => {
    useDemoStore.setState({
      showPaykeyGenerator: true,
      generatorData: { customerName: 'Test', paykeyToken: '', accountLast4: '', routingNumber: '' },
    });

    render(<PaykeyGeneratorModal />);

    // Check for Arcade Header
    expect(screen.getByText(/PAYKEY GENERATOR V5/)).toBeInTheDocument();

    // Check for Canvas
    expect(screen.getByTestId('arcade-canvas')).toBeInTheDocument();

    // Check for Status Bar
    expect(screen.getByText(/SCORE:/)).toBeInTheDocument();
    expect(screen.getByText(/STAGE:/)).toBeInTheDocument();
  });

  it('should call clearGeneratorData on cancel button click', () => {
    useDemoStore.setState({
      showPaykeyGenerator: true,
      generatorData: { customerName: 'Test', paykeyToken: '', accountLast4: '', routingNumber: '' },
    });

    render(<PaykeyGeneratorModal />);

    const cancelBtn = screen.getByText('[ CANCEL ]');
    fireEvent.click(cancelBtn);

    expect(mockClearGeneratorData).toHaveBeenCalled();
  });

  it('should call clearGeneratorData on completion', () => {
    useDemoStore.setState({
      showPaykeyGenerator: true,
      generatorData: { customerName: 'Test', paykeyToken: '', accountLast4: '', routingNumber: '' },
    });

    render(<PaykeyGeneratorModal />);

    // Simulate completion via mock
    fireEvent.click(screen.getByTestId('complete-btn'));

    expect(mockClearGeneratorData).toHaveBeenCalled();
  });
});
