import { useRef, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { formatDisplayDate } from '../utils/dateUtils';

// Custom cell renderer for change with color coding
const ChangeRenderer = (params) => {
  const value = params.value;
  if (value === null || value === undefined) return <span>-</span>;

  const numValue = typeof value === 'number' ? value : parseFloat(value);
  const color = numValue >= 0 ? 'text-green-600' : 'text-red-600';
  const sign = numValue >= 0 ? '+' : '';

  return (
    <span className={`font-medium ${color}`}>
      {sign}
      {numValue.toFixed(4)}
    </span>
  );
};

export const CurrencyGrid = ({ data = [], loading = false }) => {
  const gridRef = useRef(null);

  const columnDefs = useMemo(
    () => [
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
      {
        headerName: 'Exchange Rate',
        field: 'rate',
        sortable: true,
        filter: true,
        width: 200,
        valueFormatter: (params) =>
          params.value ? params.value.toFixed(4) : '-',
        cellStyle: { textAlign: 'right' },
      },
    ],
    []
  );

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

  if (!data || data.length === 0) {
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

  return (
    <div className="w-full">
      <div
        className="ag-theme-alpine dark:ag-theme-alpine-dark"
        style={{ width: '100%' }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
};
