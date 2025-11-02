import { format, subYears, isAfter, differenceInDays } from 'date-fns';
import { MAX_DATE_RANGE_YEARS } from './constants';

export const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd');
};

export const parseDate = (dateString) => {
  return new Date(dateString);
};

export const getMaxStartDate = (endDate) => {
  const end = parseDate(endDate);
  const maxStart = subYears(end, MAX_DATE_RANGE_YEARS);
  return formatDate(maxStart);
};

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

export const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = subYears(endDate, 1);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

export const formatDisplayDate = (dateString) => {
  const date = parseDate(dateString);
  return format(date, 'MMM dd, yyyy');
};
