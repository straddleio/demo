import { render, screen, fireEvent } from '@testing-library/react';
import { DemoCard } from '../DemoCard';
import { describe, it, expect, vi } from 'vitest';

describe('DemoCard', () => {
  it('should render demo mode title', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<DemoCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    expect(screen.getByText('AUTO')).toBeInTheDocument();
    expect(screen.getByText('ATTACK')).toBeInTheDocument();
  });

  it('should render demo flow description', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<DemoCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    expect(
      screen.getByText('Execute full happy-path flow: Customer → Paykey → Charge')
    ).toBeInTheDocument();
  });

  it('should render demo steps', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<DemoCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    expect(screen.getByText('⚡ Create verified customer')).toBeInTheDocument();
    expect(screen.getByText('⚡ Link active bank account')).toBeInTheDocument();
    expect(screen.getByText('⚡ Process successful charge')).toBeInTheDocument();
  });

  it('should call onConfirm and onClose when execute button clicked', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<DemoCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    const executeButton = screen.getByText(/EXECUTE COMBO/i);
    fireEvent.click(executeButton);

    expect(mockConfirm).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should not render when isOpen is false', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    const { container } = render(
      <DemoCard isOpen={false} onClose={mockClose} onConfirm={mockConfirm} />
    );

    // CommandCard should not be visible when isOpen is false
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();
  });

  it('should render execute button with correct styling', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(
      <DemoCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />
    );

    const executeButton = screen.getByText(/EXECUTE COMBO/i);
    expect(executeButton).toHaveClass('w-full');
    expect(executeButton).toHaveClass('font-pixel');
    expect(executeButton).toHaveClass('uppercase');
  });
});
