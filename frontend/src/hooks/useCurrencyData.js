import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { fetchCurrencyData, fetchCompareCurrencyData } from '../utils/api';
import { DEBOUNCE_DELAY } from '../utils/constants';

export function useCurrencyData({ currencies, dateRange, compareMode, enabled = true }) {
  const [data, setData] = useState(null); // Change to null instead of []
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!enabled || currencies.length === 0) {
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
      let response;

      if (compareMode && currencies.length > 1) {
        const [baseCurrency, ...compareCurrencies] = currencies;
        response = await fetchCompareCurrencyData(
          baseCurrency,
          compareCurrencies,
          dateRange
        );
      } else {
        console.log("sINgLE")
        response = await fetchCurrencyData(currencies, dateRange);
      }

      console.log('[useCurrencyData] Response received:', response);

      // Set the entire response object, not just response.data
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
  }, [currencies, dateRange, compareMode, enabled]);

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