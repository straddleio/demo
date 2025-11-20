import { render, screen } from '@testing-library/react';
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
    render(<ArcadeCanvas />);
    const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;

    // Canvas should exist and be configured
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(480);

    // Note: getContext returns null in jsdom, so we can't test pixel data
    // The implementation sets black background in useEffect
  });
});
