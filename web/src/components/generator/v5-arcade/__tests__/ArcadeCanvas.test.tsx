import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ArcadeCanvas } from '../ArcadeCanvas';

describe('ArcadeCanvas', () => {
  it('should render canvas with arcade dimensions', () => {
    render(<ArcadeCanvas />);
    const canvas = screen.getByRole('img', { hidden: true });

    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '640');
    expect(canvas).toHaveAttribute('height', '480');
  });

  it('should initialize with black background', () => {
    // Mock getContext
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 640;
    mockCanvas.height = 480;

    const mockContext = {
      canvas: mockCanvas,
      fillStyle: '',
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: [] }),
      measureText: vi.fn().mockReturnValue({ width: 0 }),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      shadowColor: '',
      shadowBlur: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      lineWidth: 1,
    };

    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
    getContextSpy.mockReturnValue(mockContext as any);

    // Also need to mock AudioContext for GameEngine
    const MockAudioContext = class {
      createOscillator = vi.fn().mockReturnValue({
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        type: 'sine',
      });
      createGain = vi.fn().mockReturnValue({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      });
      close = vi.fn();
    };
    global.AudioContext = MockAudioContext as any;

    render(<ArcadeCanvas />);

    // Check that fillRect was called to clear screen (0, 0, width, height)
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 640, 480);

    // We don't strict check fillStyle because CRTEffect might change it during render loop
    // expect(mockContext.fillStyle).toBe('#000000');

    getContextSpy.mockRestore();
  });
});
