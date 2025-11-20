import { render, screen, fireEvent } from '@testing-library/react';
import { ResetCard } from '../ResetCard';
import { describe, it, expect, vi } from 'vitest';

describe('ResetCard', () => {
  it('should render reset demo title', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<ResetCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    expect(screen.getByText('WARNING')).toBeInTheDocument();
  });

  it('should render warning message', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<ResetCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    expect(screen.getByText('This will clear all demo data:')).toBeInTheDocument();
  });

  it('should render list of items to be cleared', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<ResetCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    expect(screen.getByText('• Customer data')).toBeInTheDocument();
    expect(screen.getByText('• Paykey information')).toBeInTheDocument();
    expect(screen.getByText('• Charge history')).toBeInTheDocument();
    expect(screen.getByText('• Terminal output')).toBeInTheDocument();
    expect(screen.getByText('• API logs')).toBeInTheDocument();
  });

  it('should call onClose when cancel button clicked', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<ResetCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it('should call onConfirm and onClose when reset button clicked', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<ResetCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    const resetButton = screen.getByText('🗑️ Reset');
    fireEvent.click(resetButton);

    expect(mockConfirm).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should not render when isOpen is false', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    const { container } = render(
      <ResetCard isOpen={false} onClose={mockClose} onConfirm={mockConfirm} />
    );

    // CommandCard should not be visible when isOpen is false
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();
  });

  it('should render both cancel and reset buttons', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<ResetCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('🗑️ Reset')).toBeInTheDocument();
  });

  it('should render warning emoji', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<ResetCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('should render trash can emoji on reset button', () => {
    const mockClose = vi.fn();
    const mockConfirm = vi.fn();

    render(<ResetCard isOpen={true} onClose={mockClose} onConfirm={mockConfirm} />);

    const resetButton = screen.getByText('🗑️ Reset');
    expect(resetButton.textContent).toContain('🗑️');
  });
});
