import React from 'react';
import { CURRENCIES } from '../utils/constants';

export const CurrencySelector = ({
  selectedCurrencies,
  onChange,
  disabled = false,
}) => {
  const handleToggle = (currency) => {
    if (disabled) return;

    const isSelected = selectedCurrencies.includes(currency);

    if (isSelected) {
      // Don't allow deselecting the last currency
      if (selectedCurrencies.length === 1) return;
      onChange(selectedCurrencies.filter((c) => c !== currency));
    } else {
      onChange([...selectedCurrencies, currency]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Currencies
        
      </label>
      <div className="flex flex-wrap gap-2">
        {CURRENCIES.map((currency) => {
          const isSelected = selectedCurrencies.includes(currency.value);
          const isDisabled =
            disabled ;

          return (
            <button
              key={currency.value}
              onClick={() => handleToggle(currency.value)}
              disabled={isDisabled}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  isSelected
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${currency.label}`}
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currency.color }}
                  aria-hidden="true"
                />
                {currency.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
