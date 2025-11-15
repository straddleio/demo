import { useState, useEffect } from 'react';

interface GeolocationData {
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  loading: boolean;
  error?: string;
}

/**
 * Hook to fetch geolocation data from IP address using ip-api.com
 * Free API with 45 requests/minute limit (no API key required)
 *
 * @param ipAddress - The IP address to lookup
 * @returns GeolocationData with city, region, country info
 */
export function useGeolocation(ipAddress: string | null): GeolocationData {
  const [data, setData] = useState<GeolocationData>({ loading: true });

  useEffect(() => {
    if (!ipAddress) {
      setData({ loading: false, error: 'No IP address provided' });
      return;
    }

    // Skip private/local IPs
    if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress === '127.0.0.1') {
      setData({
        loading: false,
        city: 'Local',
        region: 'Private',
        country: 'Network',
        countryCode: 'XX',
      });
      return;
    }

    const fetchGeolocation = async () => {
      try {
        const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,city`);
        const result = await response.json();

        if (result.status === 'success') {
          setData({
            loading: false,
            city: result.city,
            region: result.region,
            country: result.country,
            countryCode: result.countryCode,
          });
        } else {
          setData({
            loading: false,
            error: result.message || 'Failed to fetch geolocation',
          });
        }
      } catch (err) {
        setData({
          loading: false,
          error: 'Failed to fetch geolocation',
        });
      }
    };

    fetchGeolocation();
  }, [ipAddress]);

  return data;
}
