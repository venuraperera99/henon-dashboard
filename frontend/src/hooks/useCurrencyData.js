import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { fetchCompareCurrencyData } from '../utils/api';
import { DEBOUNCE_DELAY } from '../utils/constants';

export function useCurrencyData({ currencies, dateRange, enabled = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    // Need at least 2 currencies (1 base + 1 comparison)
    if (!enabled || currencies.length < 2) {
      setData(null);
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
      // First currency is always the base
      const [baseCurrency, ...compareCurrencies] = currencies;
      
      const response = await fetchCompareCurrencyData(
        baseCurrency,
        compareCurrencies,
        dateRange
      );

      console.log('[useCurrencyData] Response received:', response);

      if (response) {
        setData(response);
      } else {
        throw new Error('Failed to fetch currency data');
      }
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

  // Debounced version of fetchData
  const debouncedFetchData = useRef(
    debounce(fetchData, DEBOUNCE_DELAY, { leading: false, trailing: true })
  ).current;

  useEffect(() => {
    debouncedFetchData();

    return () => {
      debouncedFetchData.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedFetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}