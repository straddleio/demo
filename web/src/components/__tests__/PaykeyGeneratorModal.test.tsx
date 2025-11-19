import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaykeyGeneratorModal } from '../PaykeyGeneratorModal';
import { useDemoStore } from '@/lib/state';

// Mock the stage components to avoid complex animation testing
vi.mock('../generator/WaldoStage', () => ({
  WaldoStage: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="waldo-stage">
      <button onClick={onComplete}>Complete WALDO</button>
    </div>
  ),
}));

vi.mock('../generator/Blake3Stage', () => ({
  Blake3Stage: ({ onComplete }: { onComplete: (hash: string) => void }) => (
    <div data-testid="blake3-stage">
      <button onClick={() => onComplete('abc123hash')}>Complete BLAKE3</button>
    </div>
  ),
}));

vi.mock('../generator/MintingStage', () => ({
  MintingStage: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="minting-stage">
      <button onClick={onComplete}>Complete Minting</button>
    </div>
  ),
}));

describe('PaykeyGeneratorModal', () => {
  beforeEach(() => {
    // Reset store state
    useDemoStore.getState().clearGeneratorData();
  });

  it('should not render when showPaykeyGenerator is false', () => {
    const { container } = render(<PaykeyGeneratorModal />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when generatorData is null', () => {
    useDemoStore.setState({ showPaykeyGenerator: true, generatorData: null });
    const { container } = render(<PaykeyGeneratorModal />);
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when both flag and data are present', () => {
    useDemoStore.getState().setGeneratorData({
      customerName: 'John Smith',
      waldoData: {
        correlationScore: 95,
        matchedName: 'JOHN SMITH',
        namesOnAccount: ['John Smith'],
      },
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    render(<PaykeyGeneratorModal />);

    expect(screen.getByText('PAYKEY GENERATOR')).toBeInTheDocument();
    expect(screen.getByText('Generating secure token for')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  it('should start at WALDO stage when waldoData exists', () => {
    useDemoStore.getState().setGeneratorData({
      customerName: 'John Smith',
      waldoData: {
        correlationScore: 95,
        matchedName: 'JOHN SMITH',
        namesOnAccount: ['John Smith'],
      },
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    render(<PaykeyGeneratorModal />);

    expect(screen.getByTestId('waldo-stage')).toBeInTheDocument();
    expect(screen.queryByTestId('blake3-stage')).not.toBeInTheDocument();
  });

  it('should skip to BLAKE3 stage when no waldoData', () => {
    useDemoStore.getState().setGeneratorData({
      customerName: 'John Smith',
      waldoData: undefined,
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    render(<PaykeyGeneratorModal />);

    expect(screen.getByTestId('blake3-stage')).toBeInTheDocument();
    expect(screen.queryByTestId('waldo-stage')).not.toBeInTheDocument();
  });

  it('should progress through stages correctly', async () => {
    useDemoStore.getState().setGeneratorData({
      customerName: 'John Smith',
      waldoData: {
        correlationScore: 95,
        matchedName: 'JOHN SMITH',
        namesOnAccount: ['John Smith'],
      },
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    render(<PaykeyGeneratorModal />);

    // Start at WALDO
    expect(screen.getByTestId('waldo-stage')).toBeInTheDocument();

    // Complete WALDO
    fireEvent.click(screen.getByText('Complete WALDO'));

    // Should move to BLAKE3
    await waitFor(() => {
      expect(screen.getByTestId('blake3-stage')).toBeInTheDocument();
    });

    // Complete BLAKE3
    fireEvent.click(screen.getByText('Complete BLAKE3'));

    // Should move to Minting
    await waitFor(() => {
      expect(screen.getByTestId('minting-stage')).toBeInTheDocument();
    });
  });

  it('should close modal on Skip button click', () => {
    useDemoStore.getState().setGeneratorData({
      customerName: 'John Smith',
      waldoData: undefined,
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    render(<PaykeyGeneratorModal />);

    expect(screen.getByText('PAYKEY GENERATOR')).toBeInTheDocument();

    // Click Skip
    fireEvent.click(screen.getByText('SKIP'));

    // Modal should be closed
    const state = useDemoStore.getState();
    expect(state.showPaykeyGenerator).toBe(false);
    expect(state.generatorData).toBeNull();
  });

  it('should close modal on ESC key', () => {
    useDemoStore.getState().setGeneratorData({
      customerName: 'John Smith',
      waldoData: undefined,
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    render(<PaykeyGeneratorModal />);

    // Press ESC
    fireEvent.keyDown(window, { key: 'Escape' });

    // Modal should be closed
    const state = useDemoStore.getState();
    expect(state.showPaykeyGenerator).toBe(false);
    expect(state.generatorData).toBeNull();
  });

  it('should close modal on background click', () => {
    useDemoStore.getState().setGeneratorData({
      customerName: 'John Smith',
      waldoData: undefined,
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    const { container } = render(<PaykeyGeneratorModal />);

    // Click on overlay background
    const overlay = container.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
    }

    // Modal should be closed
    const state = useDemoStore.getState();
    expect(state.showPaykeyGenerator).toBe(false);
    expect(state.generatorData).toBeNull();
  });
});

describe('PaykeyGeneratorModal Performance', () => {
  it('should not re-render excessively when data does not change', () => {
    const renderSpy = vi.fn();

    const TestWrapper = () => {
      renderSpy();
      return <PaykeyGeneratorModal />;
    };

    useDemoStore.getState().setGeneratorData({
      customerName: 'John Smith',
      waldoData: undefined,
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    const { rerender } = render(<TestWrapper />);

    const initialRenderCount = renderSpy.mock.calls.length;

    // Re-render with same data
    rerender(<TestWrapper />);

    // Should not cause additional renders beyond React's normal behavior
    // Allow for 1-2 renders max (initial + potential update)
    expect(renderSpy.mock.calls.length).toBeLessThanOrEqual(initialRenderCount + 2);
  });
});
