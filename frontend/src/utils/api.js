import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
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
 * Fetch currency data for multiple currencies (non-compare mode)
 * Shows all selected currencies from EUR base
 * @param {string[]} currencies - Array of currency codes
 * @param {Object} dateRange - Date range object with startDate and endDate
 * @returns {Promise<Object>} Currency API response
 */
export const fetchCurrencyData = async (currencies, dateRange) => {
  try {
    // Use EUR as default base, or first non-EUR currency
    const base = 'EUR';
    
    // Filter out the base currency from targets
    const targetCurrencies = currencies.filter(c => c !== base);
    
    // If no targets or only one currency selected, handle it
    if (targetCurrencies.length === 0) {
      // If only EUR selected, show empty state
      return {
        success: true,
        base_currency: base,
        target_currency: '',
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        source: 'api',
        data: [],
        rates: {},
        count: 0
      };
    }

    // If multiple targets, use the multiple endpoint
    if (targetCurrencies.length > 1) {
      const pairs = targetCurrencies.map(target => ({
        base: base,
        target: target,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      }));

      console.log('[API] fetchCurrencyData (multiple) pairs:', pairs);

      const response = await apiClient.post('/api/rates/multiple', {
        pairs: pairs
      });

      console.log('[API] fetchCurrencyData response:', response.data);

      if (!response.data.success) {
        throw new Error('Failed to fetch multiple currency pairs');
      }

      // Transform multiple results into rates object format
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

      // Convert to array format for data property
      const dataArray = Object.entries(ratesObject)
        .map(([date, rates]) => ({
          date,
          ...rates
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        success: true,
        base_currency: base,
        target_currency: targetCurrencies.join(','),
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        source: 'api',
        data: dataArray,
        rates: ratesObject,
        count: dataArray.length
      };
    } else {
      // Single target currency
      const target = targetCurrencies[0];
      
      const response = await apiClient.get('/api/rates', {
        params: {
          base: base,
          target: target,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        },
      });

      console.log('[API] fetchCurrencyData response:', response.data);

      // Transform array data to rates object format
      const ratesObject = {};
      
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((item) => {
          ratesObject[item.date] = {
            [target]: item.rate
          };
        });
      }

      return {
        ...response.data,
        rates: ratesObject
      };
    }
  } catch (error) {
    console.error('[API] fetchCurrencyData error:', error);
    throw error;
  }
};

/**
 * Fetch currency data for multiple pairs (compare mode)
 * @param {string} baseCurrency - Base currency code
 * @param {string[]} compareCurrencies - Array of currencies to compare
 * @param {Object} dateRange - Date range object with startDate and endDate
 * @returns {Promise<Object>} Currency API response
 */
export const fetchCompareCurrencyData = async (baseCurrency, compareCurrencies, dateRange) => {
  try {
    // Filter out base currency from compare currencies
    const targetCurrencies = compareCurrencies.filter(c => c !== baseCurrency);
    
    if (targetCurrencies.length === 0) {
      return {
        success: true,
        base_currency: baseCurrency,
        target_currency: '',
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        source: 'api',
        data: [],
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

    console.log('[API] fetchCompareCurrencyData pairs:', pairs);

    const response = await apiClient.post('/api/rates/multiple', {
      pairs: pairs
    });

    console.log('[API] fetchCompareCurrencyData response:', response.data);

    if (!response.data.success) {
      throw new Error('Failed to fetch multiple currency pairs');
    }

    // Transform multiple results into rates object format
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

    // Convert to array format for data property
    const dataArray = Object.entries(ratesObject)
      .map(([date, rates]) => ({
        date,
        ...rates
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      success: true,
      base_currency: baseCurrency,
      target_currency: targetCurrencies.join(','),
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      source: 'api',
      data: dataArray,
      rates: ratesObject,
      count: dataArray.length
    };
  } catch (error) {
    console.error('[API] fetchCompareCurrencyData error:', error);
    throw error;
  }
};

export default apiClient;