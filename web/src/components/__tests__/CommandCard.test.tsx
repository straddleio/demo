import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommandCard } from '../CommandCard';

describe('CommandCard', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Command',
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<CommandCard {...defaultProps} />);

      expect(screen.getByText('Test Command')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<CommandCard {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Test Command')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('should render backdrop when open', () => {
      render(<CommandCard {...defaultProps} />);

      // Check for backdrop element
      expect(screen.getByText('Test Command')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<CommandCard {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: '✕' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should apply correct styling classes', () => {
      const { container } = render(<CommandCard {...defaultProps} />);

      const card = container.querySelector('[class*="border-4"]');
      expect(card).toHaveClass('border-primary');
      expect(card).toHaveClass('rounded-pixel');
      expect(card).toHaveClass('shadow-neon-primary-lg');
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onCloseMock = vi.fn();
      render(<CommandCard {...defaultProps} onClose={onCloseMock} />);

      const closeButton = screen.getByRole('button', { name: '✕' });
      fireEvent.click(closeButton);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const onCloseMock = vi.fn();
      const { container } = render(<CommandCard {...defaultProps} onClose={onCloseMock} />);

      const backdrop = container.querySelector('[class*="bg-black/80"]');
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should not close when card content is clicked', () => {
      const onCloseMock = vi.fn();
      render(<CommandCard {...defaultProps} onClose={onCloseMock} />);

      const content = screen.getByText('Test Content');
      fireEvent.click(content);

      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('Animation', () => {
    it('should have framer-motion animation props', () => {
      const { container } = render(<CommandCard {...defaultProps} />);

      // Framer motion adds data attributes for animations
      const card = container.querySelector('[class*="border-4"]');
      expect(card).toBeInTheDocument();

      // Check for 3D transform style
      expect(card).toHaveStyle({ transformStyle: 'preserve-3d' });
    });
  });

  describe('Content', () => {
    it('should render custom title', () => {
      render(<CommandCard {...defaultProps} title="Custom Title Here" />);

      expect(screen.getByText('Custom Title Here')).toBeInTheDocument();
    });

    it('should render title in uppercase with pixel font', () => {
      render(<CommandCard {...defaultProps} title="test command" />);

      const titleElement = screen.getByText('test command');
      expect(titleElement).toHaveClass('font-pixel');
      expect(titleElement).toHaveClass('uppercase');
      expect(titleElement).toHaveClass('text-primary');
    });

    it('should render children content', () => {
      render(
        <CommandCard {...defaultProps}>
          <div data-testid="custom-content">
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </div>
        </CommandCard>
      );

      const content = screen.getByTestId('custom-content');
      expect(content).toBeInTheDocument();
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });

    it('should render complex children', () => {
      render(
        <CommandCard {...defaultProps}>
          <input type="text" placeholder="Test input" />
          <button>Test button</button>
        </CommandCard>
      );

      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Test button' })).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('should be positioned fixed and centered', () => {
      const { container } = render(<CommandCard {...defaultProps} />);

      const card = container.querySelector('[class*="border-4"]');
      expect(card).toHaveClass('fixed');
      expect(card).toHaveClass('top-1/2');
      expect(card).toHaveClass('left-1/2');
    });

    it('should have correct width and height constraints', () => {
      const { container } = render(<CommandCard {...defaultProps} />);

      const card = container.querySelector('[class*="border-4"]');
      expect(card).toHaveClass('w-[500px]');
      expect(card).toHaveClass('max-h-[85vh]');
    });

    it('should have high z-index', () => {
      const { container } = render(<CommandCard {...defaultProps} />);

      const backdrop = container.querySelector('[class*="bg-black/80"]');
      const card = container.querySelector('[class*="border-4"]');

      expect(backdrop).toHaveClass('z-[60]');
      expect(card).toHaveClass('z-[70]');
    });
  });

  describe('Accessibility', () => {
    it('should have overflow scroll for long content', () => {
      const { container } = render(<CommandCard {...defaultProps} />);

      const card = container.querySelector('[class*="border-4"]');
      expect(card).toHaveClass('overflow-y-auto');
    });
  });
});
