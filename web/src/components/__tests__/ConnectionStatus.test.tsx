import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ConnectionStatus } from '../ConnectionStatus';
import { useDemoStore } from '@/lib/state';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ConnectionStatus', () => {
  beforeEach(() => {
    // Clear store before each test - use individual setters for mocked store
    useDemoStore.getState().setConnected(false);
    useDemoStore.getState().setConnectionError(null);

    // Clear localStorage
    localStorageMock.clear();
  });

  describe('Connection Status Display', () => {
    it('should show LIVE when connected', () => {
      useDemoStore.getState().setConnected(true);
      useDemoStore.getState().setConnectionError(null);
      render(<ConnectionStatus />);

      expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    it('should show OFFLINE when disconnected', () => {
      useDemoStore.getState().setConnected(false);
      useDemoStore.getState().setConnectionError(null);
      render(<ConnectionStatus />);

      expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    });

    it('should show error message when connectionError is set', () => {
      useDemoStore.getState().setConnected(false);
      useDemoStore.getState().setConnectionError('Connection failed');
      render(<ConnectionStatus />);

      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('should render green pulse dot when connected', () => {
      useDemoStore.getState().setConnected(true);
      const { container } = render(<ConnectionStatus />);

      const dot = container.querySelector('.bg-accent-green');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveClass('animate-pulse');
    });

    it('should render red dot when disconnected', () => {
      useDemoStore.getState().setConnected(false);
      const { container } = render(<ConnectionStatus />);

      const dot = container.querySelector('.bg-accent-red');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('Positioning and Styling', () => {
    it('should be fixed in top-right corner', () => {
      useDemoStore.getState().setConnected(true);
      const { container} = render(<ConnectionStatus />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('fixed');
      expect(wrapper).toHaveClass('top-4');
      expect(wrapper).toHaveClass('right-4');
    });

    it('should have high z-index', () => {
      useDemoStore.getState().setConnected(true);
      const { container } = render(<ConnectionStatus />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('z-50');
    });

    it('should have retro styling', () => {
      useDemoStore.getState().setConnected(true);
      const { container } = render(<ConnectionStatus />);

      const statusBox = container.querySelector('[class*="border-primary"]');
      expect(statusBox).not.toBeNull();
      expect(statusBox).toHaveClass('bg-background-dark/80');
      expect(statusBox).toHaveClass('backdrop-blur-sm');
      expect(statusBox).toHaveClass('rounded');
    });

    it('should use pixel font for status text', () => {
      useDemoStore.getState().setConnected(true);
      render(<ConnectionStatus />);

      const statusText = screen.getByText('LIVE');
      expect(statusText).toHaveClass('font-pixel');
      expect(statusText).toHaveClass('text-xs');
    });
  });

  describe('Integration with Store', () => {
    it('should update when store connection state changes', () => {
      useDemoStore.getState().setConnected(false);
      const { rerender } = render(<ConnectionStatus />);

      expect(screen.getByText('OFFLINE')).toBeInTheDocument();

      // Update store
      useDemoStore.getState().setConnected(true);
      rerender(<ConnectionStatus />);

      expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    it('should update when store error changes', () => {
      useDemoStore.getState().setConnected(false);
      useDemoStore.getState().setConnectionError(null);
      const { rerender } = render(<ConnectionStatus />);

      expect(screen.getByText('OFFLINE')).toBeInTheDocument();

      // Set error
      useDemoStore.getState().setConnectionError('Network timeout');
      rerender(<ConnectionStatus />);

      expect(screen.getByText('Network timeout')).toBeInTheDocument();
    });
  });
});
