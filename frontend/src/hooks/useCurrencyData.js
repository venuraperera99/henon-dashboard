/**
 * useCurrencyData Hook
 * 
 * Custom React hook responsible for fetching and managing currency exchange rate data
 * for one or more selected currencies over a given date range.
 *
 * Core Features:
 * - Fetch exchange rate data using `fetchCompareCurrencyData`
 * - Handle loading and error states
 * - Cancel in-flight requests to prevent race conditions
 *
 *
 * Parameters:
 * @param {Object} options
 * @param {string[]} options.currencies - List of currencies where the first is the base and the rest are targets
 * @param {Object} options.dateRange - Contains `startDate` and `endDate` for fetching historical data
 * @param {boolean} [options.enabled=true] - Controls whether data fetching should be active
 *
 * Returns:
 * @returns {Object} {
 *   data: CurrencyApiResponse | null,   // API response data
 *   loading: boolean,                   // Indicates if the fetch is in progress
 *   error: Error | null,                // Any fetch or API-related error
 *   refetch: Function                   // Manual trigger to re-fetch the data
 * }
 *
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCompareCurrencyData } from '../utils/api';

export function useCurrencyData({ currencies, dateRange, enabled = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!enabled || currencies.length < 2) {
      setData(null);
      return;
    }

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const [baseCurrency, ...compareCurrencies] = currencies;

      const response = await fetchCompareCurrencyData(
        baseCurrency,
        compareCurrencies,
        dateRange
      );

      setData(response || null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[useCurrencyData] Error:', err);
        setError(err);
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [currencies, dateRange, enabled]);

  // Fetch whenever currencies or dateRange change
  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
