/**
 * DateRangePicker Component
 * 
 * A reusable date range selector that allows users to pick a start and end date 
 * within a maximum allowed window which is 2 years as per assignment requirements. 
 * 
 * It validates the range dynamically and provides feedback if the user selects invalid dates
 * 
 * Props:
 * - dateRange: { startDate: string, endDate: string }
 *     The currently selected range, formatted as 'YYYY-MM-DD'.
 * 
 * - onChange: function({ startDate, endDate })
 *     Callback triggered whenever a valid new date range is selected.
 * 
 * - disabled: boolean (optional)
 *     Disables the input fields when true.
 */

import React, { useState, useEffect } from 'react';
import { formatDate, validateDateRange, getMaxStartDate } from '../utils/dateUtils';

export const DateRangePicker = ({ dateRange, onChange, disabled = false }) => {
  const [localStartDate, setLocalStartDate] = useState(dateRange.startDate);
  const [localEndDate, setLocalEndDate] = useState(dateRange.endDate);
  const [error, setError] = useState('');

  /**
   * Keep local state in sync if the parent updates the date range.
   */
  useEffect(() => {
    setLocalStartDate(dateRange.startDate);
    setLocalEndDate(dateRange.endDate);
  }, [dateRange]);

  /**
   * Handles updates to the start date.
   * Validates the new range and triggers onChange if valid.
   */
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setLocalStartDate(newStartDate);
    setError('');

    if (validateDateRange(newStartDate, localEndDate)) {
      onChange({ startDate: newStartDate, endDate: localEndDate });
    } else {
      setError('Date range exceeds maximum of 2 years or start date is after end date');
    }
  };

  /**
   * Handles updates to the end date.
   * Validates the new range and triggers onChange if valid.
   */
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setLocalEndDate(newEndDate);
    setError('');

    if (validateDateRange(localStartDate, newEndDate)) {
      onChange({ startDate: localStartDate, endDate: newEndDate });
    } else {
      setError('Date range exceeds maximum of 2 years or start date is after end date');
    }
  };

  // Define boundaries for selectable dates
  const maxStartDate = getMaxStartDate(localEndDate);
  const today = formatDate(new Date());

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Date Range
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
          (Max 2 years)
        </span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Start Date Input */}
        <div>
          <label htmlFor="start-date" className="sr-only">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={localStartDate}
            onChange={handleStartDateChange}
            disabled={disabled}
            max={localEndDate}
            min={maxStartDate}
            className={`
              w-full px-4 py-2 rounded-lg border
              bg-white dark:bg-gray-800
              border-gray-300 dark:border-gray-600
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            `}
            aria-label="Start date"
            aria-invalid={!!error}
            aria-describedby={error ? 'date-range-error' : undefined}
          />
        </div>

        {/* End Date Input */}
        <div>
          <label htmlFor="end-date" className="sr-only">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={localEndDate}
            onChange={handleEndDateChange}
            disabled={disabled}
            min={localStartDate}
            max={today}
            className={`
              w-full px-4 py-2 rounded-lg border
              bg-white dark:bg-gray-800
              border-gray-300 dark:border-gray-600
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            `}
            aria-label="End date"
            aria-invalid={!!error}
            aria-describedby={error ? 'date-range-error' : undefined}
          />
        </div>
      </div>

      {/* Validation Error Message */}
      {error && (
        <p
          id="date-range-error"
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};
