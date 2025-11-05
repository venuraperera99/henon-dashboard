export const CURRENCIES = [
  { value: 'CAD', label: 'Canadian Dollar', color: '#ef4444' },
  { value: 'USD', label: 'US Dollar', color: '#3b82f6' },
  { value: 'EUR', label: 'Euro', color: '#10b981' },
];

export const CHART_COLORS = {
  CAD: {
    border: 'rgb(239, 68, 68)',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  USD: {
    border: 'rgb(59, 130, 246)',
    background: 'rgba(59, 130, 246, 0.1)',
  },
  EUR: {
    border: 'rgb(16, 185, 129)',
    background: 'rgba(16, 185, 129, 0.1)',
  },
};

export const MAX_DATE_RANGE_YEARS = 2;

export const STORAGE_KEYS = {
  GRID_STATE: 'currency-dashboard-grid-state',
  FILTER_STATE: 'currency-dashboard-filter-state',
};
