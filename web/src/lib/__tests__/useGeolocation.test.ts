import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGeolocation } from '../useGeolocation';

// Mock fetch
global.fetch = vi.fn();

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with loading state', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        void new Promise(() => {
          // Never resolves to test loading state
        })
    );

    const { result } = renderHook(() => useGeolocation('192.168.1.1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.city).toBeUndefined();
    expect(result.current.region).toBeUndefined();
    expect(result.current.country).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('should fetch geolocation data successfully', async () => {
    const mockData = {
      city: 'San Francisco',
      region: 'California',
      country: 'United States',
      countryCode: 'US',
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useGeolocation('192.168.1.1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.city).toBe('San Francisco');
    expect(result.current.region).toBe('California');
    expect(result.current.country).toBe('United States');
    expect(result.current.countryCode).toBe('US');
    expect(result.current.error).toBeUndefined();
  });

  it('should call correct API endpoint', async () => {
    const mockData = {
      city: 'New York',
      region: 'New York',
      country: 'United States',
      countryCode: 'US',
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockData),
    });

    renderHook(() => useGeolocation('8.8.8.8'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/geolocation/8.8.8.8')
      );
    });
  });

  it('should handle null IP address', () => {
    const { result } = renderHook(() => useGeolocation(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No IP address provided');
    expect(result.current.city).toBeUndefined();
    expect(result.current.region).toBeUndefined();
    expect(result.current.country).toBeUndefined();
  });

  it('should handle empty string IP address', () => {
    const { result } = renderHook(() => useGeolocation(''));

    // Empty string is falsy, should be treated like null
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No IP address provided');
  });

  it('should handle API error response', async () => {
    const mockError = {
      error: 'Invalid IP address',
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockError),
    });

    const { result } = renderHook(() => useGeolocation('invalid-ip'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Invalid IP address');
    expect(result.current.city).toBeUndefined();
    expect(result.current.region).toBeUndefined();
    expect(result.current.country).toBeUndefined();
  });

  it('should handle network error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useGeolocation('192.168.1.1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch geolocation');
    expect(result.current.city).toBeUndefined();
    expect(result.current.region).toBeUndefined();
    expect(result.current.country).toBeUndefined();
  });

  it('should handle fetch rejection', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Fetch failed')
    );

    const { result } = renderHook(() => useGeolocation('8.8.8.8'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch geolocation');
  });

  it('should handle partial data response', async () => {
    const mockData = {
      city: 'London',
      country: 'United Kingdom',
      // Missing region and countryCode
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useGeolocation('1.2.3.4'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.city).toBe('London');
    expect(result.current.region).toBeUndefined();
    expect(result.current.country).toBe('United Kingdom');
    expect(result.current.countryCode).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('should refetch when IP address changes', async () => {
    const mockData1 = {
      city: 'San Francisco',
      region: 'California',
      country: 'United States',
      countryCode: 'US',
    };

    const mockData2 = {
      city: 'London',
      region: 'England',
      country: 'United Kingdom',
      countryCode: 'GB',
    };

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => Promise.resolve(mockData1),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => Promise.resolve(mockData2),
      });

    const { result, rerender } = renderHook(
      ({ ip }) => useGeolocation(ip),
      { initialProps: { ip: '192.168.1.1' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.city).toBe('San Francisco');

    // Change IP address
    rerender({ ip: '8.8.8.8' });

    await waitFor(() => {
      expect(result.current.city).toBe('London');
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should not refetch when IP address stays the same', async () => {
    const mockData = {
      city: 'San Francisco',
      region: 'California',
      country: 'United States',
      countryCode: 'US',
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockData),
    });

    const { rerender } = renderHook(
      ({ ip }) => useGeolocation(ip),
      { initialProps: { ip: '192.168.1.1' } }
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Rerender with same IP
    rerender({ ip: '192.168.1.1' });

    // Should not fetch again
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle transition from null to valid IP', async () => {
    const mockData = {
      city: 'Tokyo',
      region: 'Tokyo',
      country: 'Japan',
      countryCode: 'JP',
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockData),
    });

    const { result, rerender } = renderHook<
      { city?: string; region?: string; country?: string; countryCode?: string; loading: boolean; error?: string },
      { ip: string | null }
    >(
      ({ ip }) => useGeolocation(ip),
      { initialProps: { ip: null } }
    );

    expect(result.current.error).toBe('No IP address provided');
    expect(fetch).not.toHaveBeenCalled();

    // Provide valid IP
    rerender({ ip: '1.2.3.4' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.city).toBe('Tokyo');
    expect(result.current.error).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle transition from valid IP to null', async () => {
    const mockData = {
      city: 'Paris',
      region: 'Île-de-France',
      country: 'France',
      countryCode: 'FR',
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockData),
    });

    const { result, rerender } = renderHook<
      { city?: string; region?: string; country?: string; countryCode?: string; loading: boolean; error?: string },
      { ip: string | null }
    >(
      ({ ip }) => useGeolocation(ip),
      { initialProps: { ip: '5.6.7.8' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.city).toBe('Paris');

    // Set IP to null
    rerender({ ip: null });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No IP address provided');
    expect(result.current.city).toBeUndefined();
  });

  it('should use correct API endpoint path', async () => {
    const mockData = {
      city: 'Berlin',
      region: 'Berlin',
      country: 'Germany',
      countryCode: 'DE',
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockData),
    });

    renderHook(() => useGeolocation('9.9.9.9'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/geolocation/9.9.9.9')
      );
    });
  });

  it('should handle concurrent requests correctly', async () => {
    const mockData1 = {
      city: 'Chicago',
      region: 'Illinois',
      country: 'United States',
      countryCode: 'US',
    };

    const mockData2 = {
      city: 'Miami',
      region: 'Florida',
      country: 'United States',
      countryCode: 'US',
    };

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockData1), 100);
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => Promise.resolve(mockData2),
      });

    const { result, rerender } = renderHook(
      ({ ip }) => useGeolocation(ip),
      { initialProps: { ip: '10.0.0.1' } }
    );

    // Immediately change IP before first request completes
    rerender({ ip: '10.0.0.2' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should show data from second request
    expect(result.current.city).toBe('Miami');
  });
});
