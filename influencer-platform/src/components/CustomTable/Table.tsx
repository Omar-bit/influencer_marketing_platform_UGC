import React, { useEffect, useState, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortDirection,
} from '@tanstack/react-table';
import { useTheme } from '@/providers/themeContext';

// Icons for sort indicators
const SortAscIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 inline-block">
    <path d="m5 15 7-7 7 7"/>
  </svg>
);

const SortDescIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 inline-block">
    <path d="m19 9-7 7-7-7"/>
  </svg>
);

const SortDefaultIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 inline-block opacity-30">
    <path d="m5 15 7-7 7 7"/>
    <path d="m19 9-7 7-7-7"/>
  </svg>
);

type Data = any;

type Props = {
  data: Data[];
  columns: any[];
  selectedRows?: Record<string, boolean>;
  onRowSelectionChange?: (newSelection: Record<string, boolean>) => void;
};

export const columnHelper = createColumnHelper<Data>();

const Table: React.FC<Props> = ({
  columns,
  data,
  selectedRows = {},
  onRowSelectionChange = () => {},
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isMobile, setIsMobile] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();

    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const headerCellStyle = {
    backgroundColor: '#1a202c',
    color: '#ffffff',
    padding: isMobile ? '8px 12px' : '12px 16px',
    fontWeight: 600,
    fontSize: isMobile ? '12px' : '14px',
    textAlign: 'left' as 'left' | 'center' | 'right',
    whiteSpace: 'nowrap' as const,
  };

  const getCellStyle = (
    alignment: 'left' | 'center' | 'right' = 'left',
    isEven: boolean,
    isSelected: boolean
  ) => ({
    backgroundColor: isSelected
      ? isDarkMode
        ? '#3B82F6'
        : '#DBEAFE'
      : isDarkMode
      ? isEven
        ? '#2D3748'
        : '#1F2937'
      : isEven
      ? '#F9FAFB'
      : '#FFFFFF',
    padding: isMobile ? '8px 12px' : '12px 16px',
    fontSize: isMobile ? '12px' : '14px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
    color: isSelected
      ? isDarkMode
        ? '#FFFFFF'
        : '#1E40AF'
      : isDarkMode
      ? '#F9FAFB'
      : '#111827',
    textAlign: alignment,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  });

  const tableStyle = {
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
    backgroundColor: isDarkMode ? '#1F2937' : 'white',
    width: '100%',
    borderCollapse: 'collapse' as const,
  };

  const handleRowClick = (rowId: string) => {
    const newSelectedRows = { ...selectedRows };
    if (newSelectedRows[rowId]) {
      delete newSelectedRows[rowId];
    } else {
      newSelectedRows[rowId] = true;
    }
    onRowSelectionChange(newSelectedRows);
  };

  const renderSortingIcon = (isSorted: false | SortDirection) => {
    if (!isSorted) {
      return <SortDefaultIcon />;
    } else if (isSorted === 'asc') {
      return <SortAscIcon />;
    } else {
      return <SortDescIcon />;
    }
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className='w-full'>
        {table.getRowModel().rows.map((row, rowIndex) => {
          const isSelected = !!selectedRows[row.original._id || row.id];
          return (
            <div
              key={row.id}
              className={`mb-4 rounded-lg border ${
                isSelected
                  ? isDarkMode
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-blue-500 bg-blue-50'
                  : isDarkMode
                  ? 'border-gray-700 bg-gray-800'
                  : 'border-gray-200 bg-white'
              }`}
              onClick={() => handleRowClick(row.original._id || row.id)}
            >
              <div
                className={`p-3 ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-blue-900/30'
                      : 'bg-blue-50'
                    : isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-50'
                } rounded-t-lg font-medium`}
              >
                {/* Display primary identifier in the header */}
                {row.getVisibleCells()[0] &&
                  flexRender(
                    row.getVisibleCells()[0].column.columnDef.cell,
                    row.getVisibleCells()[0].getContext()
                  )}
              </div>
              <div className='p-3 space-y-2'>
                {row
                  .getVisibleCells()
                  .slice(1)
                  .map((cell) => {
                    const header = cell.column.columnDef.header;
                    const headerContent =
                      typeof header === 'function' ? header({} as any) : header;

                    return (
                      <div key={cell.id} className='flex flex-col'>
                        <div className='text-xs text-gray-500 dark:text-gray-400'>
                          {headerContent}
                        </div>
                        <div>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className='rounded-lg w-full'>
      <div
        style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
        ref={tableRef}
      >
        <table style={tableStyle}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const alignment =
                    ((header.column.columnDef as any).align as
                      | 'left'
                      | 'center'
                      | 'right') || 'left';
                  return (
                    <th
                      key={header.id}
                      style={{
                        ...headerCellStyle,
                        textAlign: alignment,
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center justify-start">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="inline-flex">
                            {renderSortingIcon(header.column.getIsSorted())}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                onClick={() => handleRowClick(row.original._id || row.id)}
              >
                {row.getVisibleCells().map((cell) => {
                  const alignment =
                    ((cell.column.columnDef as any).align as
                      | 'left'
                      | 'center'
                      | 'right') || 'left';
                  const isSelected = !!selectedRows[row.original._id || row.id];
                  return (
                    <td
                      key={cell.id}
                      style={getCellStyle(
                        alignment,
                        rowIndex % 2 === 0,
                        isSelected
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
