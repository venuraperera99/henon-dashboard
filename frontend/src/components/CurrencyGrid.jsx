import { useRef, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { formatDisplayDate } from '../utils/dateUtils';

export const CurrencyGrid = ({ data, loading = false }) => {
  const gridRef = useRef(null);

  // Extract currencies dynamically from data
  const currencies = useMemo(() => {
    if (!data || !data.rates) return [];
    const firstDate = Object.keys(data.rates)[0];
    return firstDate ? Object.keys(data.rates[firstDate]) : [];
  }, [data]);

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
      }
    ];

    // Add a column for each currency
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

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    []
  );

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

  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

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

  // Transform rates object to row data
  const rowData = Object.entries(data.rates).map(([date, rates]) => ({
    date,
    ...rates
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