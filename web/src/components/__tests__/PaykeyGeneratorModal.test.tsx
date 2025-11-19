import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaykeyGeneratorModal } from '../PaykeyGeneratorModal';
import { useDemoStore } from '@/lib/state';

// Mock Canvas from @react-three/fiber to avoid WebGL initialization in tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">{children}</div>
  ),
  useProgress: () => ({ progress: 100 }),
}));

// Mock drei utilities
vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="html-mock">{children}</div>
  ),
  useProgress: () => ({ progress: 100 }),
}));

// Mock the 3D stage components to avoid complex animation and Canvas testing
vi.mock('../generator/v5/stages/Waldo3D', () => ({
  Waldo3D: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="waldo-stage">
      <button onClick={onComplete}>Complete WALDO</button>
    </div>
  ),
}));

vi.mock('../generator/v5/stages/Blake3D', () => ({
  Blake3D: ({ onComplete }: { onComplete: (hash: string) => void }) => (
    <div data-testid="blake3-stage">
      <button onClick={() => onComplete('abc123hash')}>Complete BLAKE3</button>
    </div>
  ),
}));

vi.mock('../generator/v5/stages/Minting3D', () => ({
  Minting3D: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="minting-stage">
      <button onClick={onComplete}>Complete Minting</button>
    </div>
  ),
}));

// Mock the 3D Scene component
vi.mock('../generator/v5/Scene', () => ({
  Scene: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scene-container">{children}</div>
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
    expect(screen.getByText('GPU_ACCELERATED // WEBGL2.0 // R3F')).toBeInTheDocument();
    expect(screen.getByText('SECURE_ENCLAVE_ACTIVE')).toBeInTheDocument();
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

  it('should close modal on TERMINATE_SEQUENCE button click', () => {
    useDemoStore.getState().setGeneratorData({
      customerName: 'John Smith',
      waldoData: undefined,
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    render(<PaykeyGeneratorModal />);

    expect(screen.getByText('PAYKEY GENERATOR')).toBeInTheDocument();

    // Click TERMINATE_SEQUENCE button
    fireEvent.click(screen.getByText(/TERMINATE_SEQUENCE/));

    // Modal should be closed
    const state = useDemoStore.getState();
    expect(state.showPaykeyGenerator).toBe(false);
    expect(state.generatorData).toBeNull();
  });

  it('should display GPU stats and encryption status', () => {
    useDemoStore.getState().setGeneratorData({
      customerName: 'John Smith',
      waldoData: undefined,
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    render(<PaykeyGeneratorModal />);

    // Check for GPU stats
    expect(screen.getByText('FPS: 60')).toBeInTheDocument();
    expect(screen.getByText('DRAW_CALLS: 12')).toBeInTheDocument();
    expect(screen.getByText('MEM: 24MB')).toBeInTheDocument();
  });

  it('should display customer UID from generatorData', () => {
    const customerName = 'Alberta Bobbeth Charleson';
    useDemoStore.getState().setGeneratorData({
      customerName,
      waldoData: undefined,
      paykeyToken: 'token_123',
      accountLast4: '1234',
      routingNumber: '021000021',
    });

    render(<PaykeyGeneratorModal />);

    // Check for customer UID display
    expect(screen.getByText(new RegExp(`UID: ${customerName}`))).toBeInTheDocument();
  });
});

describe('PaykeyGeneratorModal Performance', () => {
  it('should not re-render excessively when data does not change', () => {
    const renderSpy = vi.fn();

    const TestWrapper = (): React.JSX.Element => {
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
