import { useEffect, useState, useCallback, useRef } from 'react';
import API from '../api/client';

/**
 * useFetch Hook
 * Generic fetch hook for making API calls with loading and error states
 * 
 * Usage:
 * const { data, loading, error, refetch } = useFetch('/users/123', {
 *   method: 'GET',
 *   deps: [userId]
 * });
 * 
 * Params:
 * - url: API endpoint URL
 * - options: {
 *     method: 'GET' | 'POST' | 'PUT' | 'DELETE' (default: 'GET')
 *     body: Request body (for POST/PUT)
 *     headers: Additional headers
 *     deps: Dependency array to refetch
 *     skip: Skip initial fetch
 *   }
 * 
 * Returns:
 * - data: Response data
 * - loading: Loading state
 * - error: Error message
 * - refetch: Function to manually refetch
 * - setData: Function to manually set data
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const {
    method = 'GET',
    body = null,
    headers = {},
    deps = [],
    skip = false
  } = options;

  // Main fetch function
  const fetchData = useCallback(async () => {
    if (skip || !url) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const config = {
        method,
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        config.data = body;
      }

      const response = await API({
        url,
        ...config
      });

      setData(response.data);
      setError(null);
    } catch (err) {
      // Ignore cancelled requests
      if (err.name !== 'AbortError') {
        setError(err.response?.data?.message || err.message || 'An error occurred');
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, body, headers, skip]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();

    // Cleanup function to abort request
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, ...deps]);

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Manual data setter
  const setDataManually = useCallback((newData) => {
    setData(newData);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    setData: setDataManually
  };
};

export default useFetch;