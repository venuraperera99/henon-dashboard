/**
 * CurrencySelector Component
 *
 * Allows users to select a base currency and up to two comparison currencies
 * from a predefined list (EUR, USD, CAD). The first selected currency becomes
 * the base, and subsequent selections become comparisons.
 *
 * - Clicking the base currency clears all selections.
 * - Clicking a comparison currency deselects it.
 *
 * Props:
 * @param {string[]} selectedCurrencies - Array of currently selected currencies.
 *   The first element represents the base currency; the rest are comparisons.
 * @param {function} onChange - Callback invoked with updated currency selections.
 * @param {boolean} disabled - If true, disables all interaction.
 *
 */
export const CurrencySelector = ({ selectedCurrencies, onChange, disabled }) => {
  const availableCurrencies = ['EUR', 'USD', 'CAD'];

  /**
   * Handles user clicking a currency button.
   * Toggles selection while ensuring one base and up to two comparison currencies.
   */
  const handleCurrencyToggle = (currency) => {
    if (selectedCurrencies.includes(currency)) {
      // Clicking the base currency resets all selections
      if (selectedCurrencies[0] === currency) {
        onChange([]);
      } else {
        // Remove a comparison currency
        onChange(selectedCurrencies.filter(c => c !== currency));
      }
    } else {
      // Nothing selected yet so set the base currency
      if (selectedCurrencies.length === 0) {
        onChange([currency]);
      } else {
        // Add a comparison currency (max 3 total)
        if (selectedCurrencies.length >= 3) return;
        onChange([...selectedCurrencies, currency]);
      }
    }
  };

  const baseCurrency = selectedCurrencies[0];
  const comparisonCurrencies = selectedCurrencies.slice(1);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Currencies
      </label>

      {/* Instruction area */}
      {selectedCurrencies.length === 0 && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
            First, select a base currency
          </p>
        </div>
      )}

      {selectedCurrencies.length === 1 && (
        <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            Base selected: <strong>{baseCurrency}</strong>
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Now select comparison currencies to view exchange rates
          </p>
        </div>
      )}

      {selectedCurrencies.length >= 2 && (
        <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            <strong>Base:</strong> {baseCurrency} → <strong>Comparing:</strong> {comparisonCurrencies.join(', ')}
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
            Click base currency to reset and start over
          </p>
        </div>
      )}

      {/* Currency buttons */}
      <div className="flex flex-wrap gap-3">
        {availableCurrencies.map((currency) => {
          const isSelected = selectedCurrencies.includes(currency);
          const isBase = currency === baseCurrency;
          const isComparison = comparisonCurrencies.includes(currency);

          return (
            <button
              key={currency}
              onClick={() => handleCurrencyToggle(currency)}
              disabled={disabled}
              className={`
                px-6 py-3 rounded-lg font-bold transition-all transform
                ${isBase 
                  ? 'bg-purple-600 text-white hover:bg-purple-700 scale-110 shadow-lg ring-2 ring-purple-300 dark:ring-purple-500'
                  : isComparison
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg">{currency}</span>
                {isBase && (
                  <span className="text-xs font-normal mt-1 opacity-90">BASE</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <p>• Purple box = Base currency (click to reset)</p>
        <p>• Blue boxes = Comparison currencies (up to 2)</p>
        <p>• Gray boxes = Available currencies</p>
      </div>
    </div>
  );
};
