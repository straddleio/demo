import { render, screen } from '@testing-library/react';
import { ArcadeHeader } from '../ArcadeHeader';

describe('ArcadeHeader', () => {
  it('should render title with block characters', () => {
    render(<ArcadeHeader />);
    const header = screen.getByText(/PAYKEY GENERATOR V5/i);
    expect(header).toBeInTheDocument();
    expect(header.textContent).toContain('▓▓▓');
  });

  it('should have cyan border styling', () => {
    const { container } = render(<ArcadeHeader />);
    const header = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(header);
    // Check individual border properties as computed 'border' may be empty
    expect(styles.borderWidth).toBe('4px');
    expect(styles.borderStyle).toBe('solid');
    expect(styles.borderColor).toBe('rgb(0, 255, 255)');
  });

  it('should use Press Start 2P font', () => {
    render(<ArcadeHeader />);
    const text = screen.getByText(/PAYKEY GENERATOR V5/i);
    const styles = window.getComputedStyle(text);
    expect(styles.fontFamily).toContain('Press Start 2P');
  });

  it('should have gradient background', () => {
    const { container } = render(<ArcadeHeader />);
    const header = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(header);
    expect(styles.background).toContain('linear-gradient');
  });

  it('should have neon glow box shadow', () => {
    const { container } = render(<ArcadeHeader />);
    const header = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(header);
    // Enhanced dual-layer shadow: outer glow + inset depth
    expect(styles.boxShadow).toContain('rgba(0, 255, 255');
  });

  it('should center text content', () => {
    const { container } = render(<ArcadeHeader />);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveStyle({ textAlign: 'center' });
  });
});
