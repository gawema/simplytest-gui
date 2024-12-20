import { useState, useCallback } from 'react';

const API_BASE_URL = 'https://simplytest-api.onrender.com';

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchApi = useCallback(async (endpoint: string, options: ApiOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          ...options.headers,
        },
        mode: 'cors',
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchApi, isLoading, error };
} 