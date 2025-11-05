/**
 * Utility functions for handling and validating date ranges.
 * 
 * These helpers are used for:
 * - Formatting and parsing dates consistently
 * - Enforcing maximum allowed date ranges based on MAX_DATE_RANGE_YEARS
 * - Providing defaults for charts, filters, or API requests
 */

import { format, subYears, isAfter, differenceInDays } from 'date-fns';
import { MAX_DATE_RANGE_YEARS } from './constants';

/**
 * Format a JavaScript Date object into `yyyy-MM-dd` format.
 * 
 * @param {Date} date - The date to format.
 * @returns {string} Formatted date string (e.g., "2025-03-10").
 */
export const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Convert a date string (e.g., "2025-03-10") into a Date object.
 * 
 * @param {string} dateString - Date in string format.
 * @returns {Date} Parsed Date object.
 */
export const parseDate = (dateString) => {
  return new Date(dateString);
};

/**
 * Calculate the earliest allowed start date given an end date.
 * 
 * Ensures that the start date does not exceed the max range limit
 * defined by `MAX_DATE_RANGE_YEARS`.
 * 
 * @param {string} endDate - The end date in `yyyy-MM-dd` format.
 * @returns {string} The latest valid start date (formatted).
 */
export const getMaxStartDate = (endDate) => {
  const end = parseDate(endDate);
  const maxStart = subYears(end, MAX_DATE_RANGE_YEARS);
  return formatDate(maxStart);
};

/**
 * Validate whether a given start and end date form a valid range.
 * 
 * Rules:
 * - Start date must not be after the end date.
 * - Date range must not exceed `MAX_DATE_RANGE_YEARS`.
 * 
 * @param {string} startDate - Start date in `yyyy-MM-dd` format.
 * @param {string} endDate - End date in `yyyy-MM-dd` format.
 * @returns {boolean} True if the range is valid, false otherwise.
 */
export const validateDateRange = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (isAfter(start, end)) {
    return false;
  }

  const daysDiff = differenceInDays(end, start);
  const maxDays = MAX_DATE_RANGE_YEARS * 365;

  return daysDiff <= maxDays;
};

/**
 * Get a default date range (past year to today).
 * 
 * Used for initializing charts or API queries when the user
 * hasn’t selected a specific date range yet.
 * 
 * @returns {{ startDate: string, endDate: string }} 
 *          Formatted start and end dates for a 1-year range.
 */
export const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = subYears(endDate, 1);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

/**
 * Convert a date string into a human-readable display format.
 * 
 * Example: "2025-03-10" → "Mar 10, 2025"
 * 
 * @param {string} dateString - Date in `yyyy-MM-dd` format.
 * @returns {string} Formatted display date.
 */
export const formatDisplayDate = (dateString) => {
  const date = parseDate(dateString);
  return format(date, 'MMM dd, yyyy');
};
