import { useCallback } from 'react';
import { CurrencyChart } from './components/CurrencyChart';
import { CurrencyGrid } from './components/CurrencyGrid';
import { CurrencySelector } from './components/CurrencySelector';
import { DateRangePicker } from './components/DateRangePicker';
import { useCurrencyData } from './hooks/useCurrencyData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getDefaultDateRange } from './utils/dateUtils';
import { STORAGE_KEYS } from './utils/constants';

function App() {

  const [filterState, setFilterState] = useLocalStorage(
    STORAGE_KEYS.FILTER_STATE,
    {
      currencies: [], // Start with empty - user must select base first
      dateRange: getDefaultDateRange(),
    }
  );


  // Fetch currency data
  const { data, loading, error, refetch } = useCurrencyData({
    currencies: filterState.currencies,
    dateRange: filterState.dateRange,
    enabled: filterState.currencies.length > 0,
  });

  const handleCurrencyChange = useCallback(
    (currencies) => {
      setFilterState((prev) => ({ ...prev, currencies }));
    },
    [setFilterState]
  );

  const handleDateRangeChange = useCallback(
    (dateRange) => {
      setFilterState((prev) => ({ ...prev, dateRange }));
    },
    [setFilterState]
  );


  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Currency Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Real-time currency exchange rate analysis and trends
                </p>
              </div>
              <div className="flex items-center gap-4">
              
                {/* Refresh Button */}
                <button
                  onClick={refetch}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  aria-label="Refresh data"
                >
                  <svg
                    className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CurrencySelector
                  selectedCurrencies={filterState.currencies}
                  onChange={handleCurrencyChange}
                  disabled={loading}
                />
                <DateRangePicker
                  dateRange={filterState.dateRange}
                  onChange={handleDateRangeChange}
                  disabled={loading}
                />
              </div>

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading exchange rates...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="mb-8">
            <CurrencyChart data={data} loading={loading} />
          </div>

          {/* Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Detailed Data
            </h2>
            <CurrencyGrid data={data} loading={loading} />
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Currency Dashboard
            </p>
          </div>
        </footer>
      </div>
  );
}

export default App