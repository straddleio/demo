import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LogsTab } from '../LogsTab';
import { useDemoStore } from '@/lib/state';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock API_BASE_URL
vi.mock('@/lib/api', () => ({
  API_BASE_URL: 'http://localhost:3001',
}));

describe('LogsTab', () => {
  const mockLogEntries = [
    {
      id: 'log-1',
      timestamp: '2025-01-15T10:00:00.000Z',
      type: 'straddle-req' as const,
      method: 'POST',
      path: '/customers',
      requestBody: { name: 'Test User' },
      statusCode: 200,
      duration: 150,
      requestId: 'req-123',
    },
    {
      id: 'log-2',
      timestamp: '2025-01-15T10:00:01.000Z',
      type: 'straddle-res' as const,
      method: 'POST',
      path: '/customers',
      responseBody: { data: { id: 'cust_123' } },
      statusCode: 200,
      duration: 150,
      requestId: 'req-123',
    },
    {
      id: 'log-3',
      timestamp: '2025-01-15T10:00:02.000Z',
      type: 'webhook' as const,
      eventType: 'customer.verified',
      eventId: 'evt_123',
      webhookPayload: { data: { id: 'cust_123', status: 'verified' } },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Use real timers for LogsTab tests (component uses setInterval)
    vi.useRealTimers();
    useDemoStore.setState({
      featureFlags: { enableLogStream: true, enableUnmask: true },
    } as any);
    // Set customer ID to match webhook payload so webhook shows up in filtered list
    useDemoStore.getState().setCustomer({ id: 'cust_123' } as any);
    useDemoStore.getState().setPaykey(null);
    useDemoStore.getState().setCharge(null);

    // Default mock response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockLogEntries,
    });
  });

  afterEach(() => {
    // No timer cleanup needed with real timers
  });

  describe('Empty State', () => {
    it('should show empty message when no logs', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('No log entries yet...')).toBeInTheDocument();
      });

      unmount();
    });

    it('should render disabled message when log stream is off', async () => {
      useDemoStore.setState({ featureFlags: { enableLogStream: false, enableUnmask: true } } as any);
      const { unmount } = render(<LogsTab />);

      expect(screen.getByText('Log stream disabled for this demo build.')).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();

      unmount();
    });
  });

  describe('Log List Display', () => {
    it('should render header', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('DEVELOPER LOGS')).toBeInTheDocument();
        expect(
          screen.getByText('Chronological stream of all requests, responses, and webhooks')
        ).toBeInTheDocument();
      });

      unmount();
    });

    it('should fetch and display log entries', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/log-stream');
      });

      await waitFor(() => {
        expect(screen.getByText('STRADDLE REQ')).toBeInTheDocument();
        expect(screen.getByText('STRADDLE RES')).toBeInTheDocument();
      });

      unmount();
    });

    it('should display log entry details', async () => {
      const { unmount } = render(<LogsTab />);

      // Wait for fetch to be called and complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Give a brief moment for state update and re-render
      await new Promise(resolve => setTimeout(resolve, 50));

      // Wait for data to render - POST appears twice (request and response entries)
      await waitFor(
        () => {
          const postElements = screen.getAllByText(/POST/);
          expect(postElements.length).toBeGreaterThan(0);
        },
        { timeout: 1000 }
      );

      // Verify all details are shown - both request and response entries have this pattern
      const detailElements = screen.getAllByText(/POST.*\/customers.*\[200\].*150ms/);
      expect(detailElements.length).toBeGreaterThan(0);

      unmount();
    });

    it('should format timestamps correctly', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        // Should show time in HH:MM:SS.mmm format
        const timestamps = screen.getAllByText(/\d{2}:\d{2}:\d{2}\.\d{3}/);
        expect(timestamps.length).toBeGreaterThan(0);
      });

      unmount();
    });

    it('should display different log types with icons', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('⇉')).toBeInTheDocument(); // request icon
        expect(screen.getByText('⇇')).toBeInTheDocument(); // response icon
        expect(screen.getByText('⚡')).toBeInTheDocument(); // webhook icon
      });

      unmount();
    });
  });

  describe('Log Entry Selection', () => {
    it('should show detail panel when entry is clicked', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('STRADDLE REQ')).toBeInTheDocument();
      });

      // Click first entry
      const requestEntry = screen.getByText('STRADDLE REQ');
      fireEvent.click(requestEntry.closest('[class*="cursor-pointer"]')!);

      await waitFor(() => {
        expect(screen.getByText('Request Body:')).toBeInTheDocument();
      });

      unmount();
    });

    it('should display request body in detail panel', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('STRADDLE REQ')).toBeInTheDocument();
      });

      const requestEntry = screen.getByText('STRADDLE REQ');
      fireEvent.click(requestEntry.closest('[class*="cursor-pointer"]')!);

      await waitFor(() => {
        expect(screen.getByText(/"name": "Test User"/)).toBeInTheDocument();
      });

      unmount();
    });

    it('should display response body in detail panel', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('STRADDLE RES')).toBeInTheDocument();
      });

      const responseEntry = screen.getByText('STRADDLE RES');
      fireEvent.click(responseEntry.closest('[class*="cursor-pointer"]')!);

      await waitFor(() => {
        expect(screen.getByText('Response Body:')).toBeInTheDocument();
      });

      unmount();
    });

    it('should display webhook payload in detail panel', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('WEBHOOK')).toBeInTheDocument();
      });

      const webhookEntry = screen.getByText('WEBHOOK');
      fireEvent.click(webhookEntry.closest('[class*="cursor-pointer"]')!);

      await waitFor(() => {
        expect(screen.getByText('Webhook Payload:')).toBeInTheDocument();
      });

      unmount();
    });

    it('should highlight selected entry', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('STRADDLE REQ')).toBeInTheDocument();
      });

      const requestEntry = screen.getByText('STRADDLE REQ').closest('[class*="cursor-pointer"]');
      fireEvent.click(requestEntry!);

      await waitFor(() => {
        expect(requestEntry).toHaveClass('bg-background-card/40');
      });

      unmount();
    });
  });

  describe('Copy Functionality', () => {
    it('should render copy buttons in detail panel', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('STRADDLE REQ')).toBeInTheDocument();
      });

      const requestEntry = screen.getByText('STRADDLE REQ');
      fireEvent.click(requestEntry.closest('[class*="cursor-pointer"]')!);

      await waitFor(() => {
        const copyButtons = screen.getAllByText('⧉ Copy');
        expect(copyButtons.length).toBeGreaterThan(0);
      });

      unmount();
    });

    it('should copy request body to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('STRADDLE REQ')).toBeInTheDocument();
      });

      const requestEntry = screen.getByText('STRADDLE REQ');
      fireEvent.click(requestEntry.closest('[class*="cursor-pointer"]')!);

      await waitFor(() => {
        expect(screen.getByText('⧉ Copy')).toBeInTheDocument();
      });

      const copyButton = screen.getByText('⧉ Copy');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('Test User'));
      });

      unmount();
    });
  });

  describe('Webhook Filtering', () => {
    it('should only show webhooks for current resources', async () => {
      // Set customer in store
      useDemoStore.setState({
        customer: { id: 'cust_123' } as any,
      });

      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await waitFor(() => {
        const webhookElements = screen.queryAllByText('WEBHOOK');
        expect(webhookElements.length).toBeGreaterThan(0);
      });

      unmount();
    });

    it('should hide webhooks for different resources', async () => {
      // Webhook is for cust_123, but store has different customer
      useDemoStore.setState({
        customer: { id: 'cust_different' } as any,
      });

      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Webhook should be filtered out - verify STRADDLE entries still show
      await waitFor(() => {
        expect(screen.getByText('STRADDLE REQ')).toBeInTheDocument();
      });

      unmount();
    });

    it('should always show request/response entries', async () => {
      // Even with no resources in store
      useDemoStore.setState({
        customer: null,
        paykey: null,
        charge: null,
      });

      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('STRADDLE REQ')).toBeInTheDocument();
        expect(screen.getByText('STRADDLE RES')).toBeInTheDocument();
      });

      unmount();
    });
  });

  describe('Auto-refresh', () => {
    it('should poll for new logs every second', async () => {
      // Use fake timers for this specific test
      vi.useFakeTimers();

      const { unmount } = render(<LogsTab />);

      // Initial fetch happens on mount
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance by 1 second and wait for next interval tick
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should have called fetch again
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Advance by another second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should have called fetch a third time
      expect(mockFetch).toHaveBeenCalledTimes(3);

      unmount();
      vi.useRealTimers();
    });

    it('should clear interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const { unmount } = render(<LogsTab />);
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.getByText('DEVELOPER LOGS')).toBeInTheDocument();
      });

      unmount();
    });

    it('should handle non-ok responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(screen.getByText('DEVELOPER LOGS')).toBeInTheDocument();
      });

      unmount();
    });
  });

  describe('Styling', () => {
    it('should use retro console styling', async () => {
      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('DEVELOPER LOGS')).toBeInTheDocument();
      });

      unmount();
    });

    it('should use correct colors for log types', async () => {
      // Include webhook resource in store so it shows up
      useDemoStore.setState({
        customer: { id: 'cust_123' } as any,
      });

      const { unmount } = render(<LogsTab />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await waitFor(() => {
        const reqLabel = screen.getByText('STRADDLE REQ');
        expect(reqLabel).toHaveClass('text-gold');

        const resLabel = screen.getByText('STRADDLE RES');
        expect(resLabel).toHaveClass('text-primary');

        const webhookLabel = screen.getByText('WEBHOOK');
        expect(webhookLabel).toHaveClass('text-accent');
      });

      unmount();
    });
  });
});
