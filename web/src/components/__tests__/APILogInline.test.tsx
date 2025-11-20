import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { APILogInline } from '../APILogInline';
import type { APILogEntry } from '@/lib/state';

describe('APILogInline', () => {
  const mockEntry: APILogEntry = {
    requestId: 'req-123',
    correlationId: 'corr-456',
    idempotencyKey: 'idem-789',
    method: 'POST',
    path: '/api/customers',
    statusCode: 200,
    duration: 250,
    timestamp: '2025-01-15T10:00:00.000Z',
    requestBody: { name: 'Test User', email: 'test@example.com' },
    responseBody: { data: { id: 'cust_123', status: 'verified' } },
  };

  describe('Collapsed State', () => {
    it('should render collapsed by default', () => {
      render(<APILogInline entry={mockEntry} />);

      // Should show compact request line
      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('POST')).toBeInTheDocument();
      expect(screen.getByText('/api/customers')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('250ms')).toBeInTheDocument();

      // Should show expand arrow
      expect(screen.getByText('▶')).toBeInTheDocument();

      // Should NOT show request/response details
      expect(screen.queryByText('Request')).not.toBeInTheDocument();
    });

    it('should apply correct method color for POST', () => {
      render(<APILogInline entry={mockEntry} />);
      const methodElement = screen.getByText('POST');
      expect(methodElement).toHaveClass('text-gold');
    });

    it('should apply correct method color for GET', () => {
      const getEntry = { ...mockEntry, method: 'GET' };
      render(<APILogInline entry={getEntry} />);
      const methodElement = screen.getByText('GET');
      expect(methodElement).toHaveClass('text-secondary');
    });

    it('should apply correct status color for 2xx', () => {
      render(<APILogInline entry={mockEntry} />);
      const statusElement = screen.getByText('200');
      expect(statusElement).toHaveClass('text-accent-green');
    });

    it('should apply correct status color for 4xx', () => {
      const errorEntry = { ...mockEntry, statusCode: 404 };
      render(<APILogInline entry={errorEntry} />);
      const statusElement = screen.getByText('404');
      expect(statusElement).toHaveClass('text-gold');
    });

    it('should apply correct status color for 5xx', () => {
      const serverErrorEntry = { ...mockEntry, statusCode: 500 };
      render(<APILogInline entry={serverErrorEntry} />);
      const statusElement = screen.getByText('500');
      expect(statusElement).toHaveClass('text-accent-red');
    });
  });

  describe('Expanded State', () => {
    it('should expand when clicked', () => {
      const { container } = render(<APILogInline entry={mockEntry} />);

      // Click to expand
      const compactLine = container.querySelector('[class*="cursor-pointer"]');
      expect(compactLine).not.toBeNull();
      fireEvent.click(compactLine!);

      // Should show collapse arrow
      expect(screen.getByText('▼')).toBeInTheDocument();

      // Should show request/response sections
      expect(screen.getByText('Request')).toBeInTheDocument();
      expect(screen.getByText('Response')).toBeInTheDocument();

      // Should show code blocks
      const preElements = container.querySelectorAll('pre');
      expect(preElements.length).toBe(2);
    });

    it('should collapse when clicked again', () => {
      const { container } = render(<APILogInline entry={mockEntry} />);

      const compactLine = container.querySelector('[class*="cursor-pointer"]');

      // Expand
      fireEvent.click(compactLine!);
      expect(screen.getByText('▼')).toBeInTheDocument();

      // Collapse
      fireEvent.click(compactLine!);
      expect(screen.getByText('▶')).toBeInTheDocument();

      // Details should be hidden
      expect(container.querySelectorAll('pre').length).toBe(0);
    });

    it('should display formatted request body', () => {
      const { container } = render(<APILogInline entry={mockEntry} />);

      // Expand
      const compactLine = container.querySelector('[class*="cursor-pointer"]');
      fireEvent.click(compactLine!);

      // Check request body is displayed
      const preElements = container.querySelectorAll('pre');
      const requestPre = preElements[0];
      expect(requestPre.textContent).toContain('Test User');
      expect(requestPre.textContent).toContain('test@example.com');
    });

    it('should display formatted response body', () => {
      const { container } = render(<APILogInline entry={mockEntry} />);

      // Expand
      const compactLine = container.querySelector('[class*="cursor-pointer"]');
      fireEvent.click(compactLine!);

      // Check response body is displayed
      const preElements = container.querySelectorAll('pre');
      const responsePre = preElements[1];
      expect(responsePre.textContent).toContain('cust_123');
      expect(responsePre.textContent).toContain('verified');
    });

    it('should render copy buttons for request and response', () => {
      render(<APILogInline entry={mockEntry} />);

      // Expand
      const compactLine = screen.getByText('API').closest('[class*="cursor-pointer"]');
      fireEvent.click(compactLine!);

      // Should have 2 copy buttons
      const copyButtons = screen.getAllByText('⧉ Copy');
      expect(copyButtons.length).toBe(2);
    });
  });

  describe('Copy Functionality', () => {
    it('should copy request body to clipboard', async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<APILogInline entry={mockEntry} />);

      // Expand
      const compactLine = screen.getByText('API').closest('[class*="cursor-pointer"]');
      fireEvent.click(compactLine!);

      // Click first copy button (request)
      const copyButtons = screen.getAllByText('⧉ Copy');
      fireEvent.click(copyButtons[0]);

      // Wait for copy to complete
      await vi.waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(
          expect.stringContaining('Test User')
        );
      });
    });

    it('should show copied confirmation', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<APILogInline entry={mockEntry} />);

      // Expand
      const compactLine = screen.getByText('API').closest('[class*="cursor-pointer"]');
      fireEvent.click(compactLine!);

      // Click copy button
      const copyButtons = screen.getAllByText('⧉ Copy');
      fireEvent.click(copyButtons[0]);

      // Should show confirmation
      await vi.waitFor(() => {
        expect(screen.getByText('✓ Copied')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request body', () => {
      const emptyEntry = { ...mockEntry, requestBody: undefined };
      const { container } = render(<APILogInline entry={emptyEntry} />);

      // Expand
      const compactLine = container.querySelector('[class*="cursor-pointer"]');
      fireEvent.click(compactLine!);

      // Should show "No data" for empty request
      expect(container.textContent).toContain('// No data');
    });

    it('should handle empty response body', () => {
      const emptyEntry = { ...mockEntry, responseBody: null };
      const { container } = render(<APILogInline entry={emptyEntry} />);

      // Expand
      const compactLine = container.querySelector('[class*="cursor-pointer"]');
      fireEvent.click(compactLine!);

      // Should show "No data" for empty response
      expect(container.textContent).toContain('// No data');
    });

    it('should handle missing optional fields', () => {
      const minimalEntry: APILogEntry = {
        requestId: 'req-123',
        correlationId: 'corr-456',
        method: 'GET',
        path: '/api/customers/123',
        statusCode: 200,
        duration: 100,
        timestamp: '2025-01-15T10:00:00.000Z',
      };

      render(<APILogInline entry={minimalEntry} />);

      // Should render without errors
      expect(screen.getByText('GET')).toBeInTheDocument();
      expect(screen.getByText('/api/customers/123')).toBeInTheDocument();
    });

    it('should apply hover effects', () => {
      const { container } = render(<APILogInline entry={mockEntry} />);

      const compactLine = container.querySelector('[class*="cursor-pointer"]');
      expect(compactLine).toHaveClass('cursor-pointer');
      expect(compactLine).toHaveClass('hover:bg-background-elevated/30');
    });
  });
});
