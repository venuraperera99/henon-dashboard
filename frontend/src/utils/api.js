import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
    };

    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data;
      apiError.message = data.message || data.error || apiError.message;
    } else if (error.message) {
      apiError.message = error.message;
    }

    return Promise.reject(apiError);
  }
);

/**
 * Fetch currency data for comparison
 * Always uses /api/rates/multiple endpoint for consistency
 * @param {string} baseCurrency - Base currency code
 * @param {string[]} compareCurrencies - Array of currencies to compare
 * @param {Object} dateRange - Date range object with startDate and endDate
 * @returns {Promise<Object>} Currency API response
 */
export const fetchCompareCurrencyData = async (baseCurrency, compareCurrencies, dateRange) => {
  try {
    const targetCurrencies = compareCurrencies.filter(c => c !== baseCurrency);
    
    if (targetCurrencies.length === 0) {
      return {
        success: true,
        base_currency: baseCurrency,
        target_currency: '',
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        source: 'api',
        rates: {},
        count: 0
      };
    }

    const pairs = targetCurrencies.map(targetCurrency => ({
      base: baseCurrency,
      target: targetCurrency,
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    }));

    console.log('[API] Fetching pairs:', pairs);

    const response = await apiClient.post('/api/rates/multiple', {
      pairs: pairs
    });

    console.log('[API] Response:', response.data);

    if (!response.data.success) {
      throw new Error('Failed to fetch currency pairs');
    }

    const ratesObject = {};
    
    response.data.results.forEach((result) => {
      const targetCurrency = result.target_currency;
      
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach((item) => {
          if (!ratesObject[item.date]) {
            ratesObject[item.date] = {};
          }
          ratesObject[item.date][targetCurrency] = item.rate;
        });
      }
    });

    console.log('[API] Final rates object:', ratesObject);

    return {
      success: true,
      base_currency: baseCurrency,
      target_currency: targetCurrencies.join(','),
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      source: 'api',
      rates: ratesObject,
      count: Object.keys(ratesObject).length
    };
  } catch (error) {
    console.error('[API] Error:', error);
    throw error;
  }
};

export default apiClient;