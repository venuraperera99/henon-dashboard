/**
 * CurrencyGrid Component
 *
 * Displays currency exchange rate data in a responsive and sortable AG Grid table.
 * Each column represents a currency, and each row represents a date with rates.
 *
 * Core Features:
 * - Dynamically generates columns based on currencies in the dataset
 * - Displays formatted dates using formatDisplayDate
 * - Supports sorting, pagination and filtering
 * - Shows a loading state and fallback message when no data is available
 *
 * Props:
 * @param {Object} data - Exchange rate data object with the structure:
 *   {
 *     base_currency: 'USD',
 *     rates: {
 *       '2024-01-01': { EUR: 0.92, CAD: 1.34 },
 *       '2024-01-02': { EUR: 0.93, CAD: 1.35 },
 *     }
 *   }
 * @param {boolean} [loading=false] - Whether the grid is currently loading
 *
 */

import { useRef, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { formatDisplayDate } from '../utils/dateUtils';

export const CurrencyGrid = ({ data, loading = false }) => {
  const gridRef = useRef(null);

  /**
   * Derive available currencies from the dataset.
   * Extracted dynamically to support varying currency lists.
   */
  const currencies = useMemo(() => {
    if (!data || !data.rates) return [];
    const firstDate = Object.keys(data.rates)[0];
    return firstDate ? Object.keys(data.rates[firstDate]) : [];
  }, [data]);

  /**
   * Define grid column structure.
   * Includes a "Date" column and one column per currency.
   */
  const columnDefs = useMemo(() => {
    const cols = [
      {
        headerName: 'Date',
        field: 'date',
        sortable: true,
        filter: true,
        width: 200,
        valueFormatter: (params) =>
          params.value ? formatDisplayDate(params.value) : '',
        pinned: 'left',
      },
    ];

    currencies.forEach(currency => {
      cols.push({
        headerName: `${data.base_currency || 'Rate'}/${currency}`,
        field: currency,
        sortable: true,
        filter: true,
        width: 200,
        valueFormatter: (params) =>
          params.value ? params.value.toFixed(4) : '-',
        cellStyle: { textAlign: 'right' },
      });
    });

    return cols;
  }, [currencies, data]);

  /** Default behavior for all columns */
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    []
  );

  /** Base grid configuration */
  const gridOptions = useMemo(
    () => ({
      animateRows: true,
      rowSelection: 'multiple',
      enableCellTextSelection: true,
      pagination: true,
      paginationPageSize: 50,
      domLayout: 'autoHeight',
    }),
    []
  );

  /** Auto-fit columns when the grid initializes */
  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  // Loading placeholder
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading grid data...</p>
        </div>
      </div>
    );
  }

  // Fallback when no data is available
  if (!data || !data.rates || Object.keys(data.rates).length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No data available
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No currency data to display
          </p>
        </div>
      </div>
    );
  }

  /** Convert nested rates object into an array for AG Grid */
  const rowData = Object.entries(data.rates).map(([date, rates]) => ({
    date,
    ...rates,
  }));

  return (
    <div className="w-full">
      <div
        className="ag-theme-alpine dark:ag-theme-alpine-dark"
        style={{ width: '100%' }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
};
