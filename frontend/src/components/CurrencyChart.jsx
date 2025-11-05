/**
 * CurrencyChart Component
 *
 * Displays currency exchange rate trends over time using a line chart.
 * Utilizes Chart.js via react-chartjs-2 for rendering.
 *
 * Features:
 * - Dynamically generates datasets for each currency in the data
 * - Formats dates on X-axis and numeric rates on Y-axis
 * - Supports dark mode styling
 * - Handles loading and no-data states with user-friendly messages
 *
 * Props:
 * @param {Object} data - Currency exchange data in the structure:
 *   {
 *     base_currency: 'USD',
 *     rates: {
 *       '2024-01-01': { EUR: 0.92, CAD: 1.34 },
 *       '2024-01-02': { EUR: 0.93, CAD: 1.35 },
 *     }
 *   }
 * @param {boolean} [loading=false] - Whether the chart is currently loading
 *
 * Example usage:
 * ```jsx
 * <CurrencyChart
 *   data={{
 *     base_currency: 'USD',
 *     rates: { '2024-01-01': { EUR: 0.92, CAD: 1.34 } }
 *   }}
 *   loading={false}
 * />
 * ```
 */

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CHART_COLORS } from '../utils/constants';
import { formatDisplayDate } from '../utils/dateUtils';

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const CurrencyChart = ({ data, loading = false }) => {
  /**
   * Transform API data into Chart.js format
   * - labels: sorted dates
   * - datasets: one per currency with custom colors and styling
   */
  const chartData = useMemo(() => {
    if (!data || !data.rates || Object.keys(data.rates).length === 0) {
      return { labels: [], datasets: [] };
    }

    const dates = Object.keys(data.rates).sort();
    const firstDateRates = data.rates[dates[0]];
    const currencies = Object.keys(firstDateRates || {});

    const datasets = currencies.map((currency, index) => {
      const rates = dates.map(date => data.rates[date]?.[currency] || 0);
      const colorConfig = CHART_COLORS[currency] || CHART_COLORS.USD;

      return {
        label: `${data.base_currency || 'Base'}/${currency}`,
        data: rates,
        borderColor: colorConfig.border,
        backgroundColor: colorConfig.background,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        spanGaps: true,
      };
    });

    return { labels: dates, datasets };
  }, [data]);

  /**
   * Chart configuration
   * - responsive with maintainAspectRatio false
   * - X/Y axis formatting
   * - Custom tooltips showing formatted dates and rates
   */
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: { size: 12, weight: 'bold' },
            color: 'rgb(107, 114, 128)',
          },
        },
        title: {
          display: true,
          text: 'Currency Exchange Rate Trends',
          font: { size: 16, weight: 'bold' },
          color: 'rgb(107, 114, 128)',
          padding: { top: 10, bottom: 20 },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          callbacks: {
            title: (context) => {
              const date = context[0].label;
              return formatDisplayDate(date);
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return value !== null ? `${label}: ${value.toFixed(4)}` : `${label}: -`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: {
            maxTicksLimit: 10,
            autoSkip: true,
            color: 'rgb(107, 114, 128)',
            font: { size: 11 },
            callback: function (_value, index) {
              const date = this.getLabelForValue(index);
              return formatDisplayDate(date);
            },
          },
        },
        y: {
          display: true,
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          ticks: {
            color: 'rgb(107, 114, 128)',
            font: { size: 11 },
            callback: function (value) {
              return typeof value === 'number' ? value.toFixed(4) : value;
            },
          },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    }),
    []
  );

  // Loading placeholder
  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Fallback when no data is available
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No data available
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select currencies and date range to view trends
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <Line data={chartData} options={options} aria-label="Currency exchange rate trend chart" />
    </div>
  );
};
