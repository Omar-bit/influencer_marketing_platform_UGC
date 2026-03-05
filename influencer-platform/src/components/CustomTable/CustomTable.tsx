'use client';
import React from 'react';
import { useTheme as useTableTheme } from '@table-library/react-table-library/theme';
import { CompactTable } from '@table-library/react-table-library/compact';
import { getTheme } from '@table-library/react-table-library/baseline';
import { useRowSelect } from '@table-library/react-table-library/select';
import { useTheme } from '@/providers/themeContext';

type columnsType = {
  label: string | React.ReactNode;
  renderCell: (item: any) => React.ReactNode | string;
  select?: boolean;
};
type CustomTableProps = {
  data: any[];
  columns: columnsType[];
  enableSelect?: boolean;
};

export default function CustomTable({
  data,
  columns,
  enableSelect = false,
}: CustomTableProps) {
  const { theme: appTheme } = useTheme();
  const isDarkMode = appTheme === 'dark';

  const tableData = {
    nodes: data.map((item, index) => ({ ...item, id: index })),
  };

  const tableTheme = useTableTheme([
    getTheme(),
    {
      HeaderCell: `
        background-color: ${isDarkMode ? '#1F2937' : '#F9FAFB'};
        color: ${isDarkMode ? '#D1D5DB' : '#6B7280'};
        padding: '5px 8px';
        font-weight: 500;
        font-size: 14px;`,

      Cell: `
        background-color: ${isDarkMode ? '#1F2937' : '#F9FAFB'};
        padding: '5px 8px';
        font-size: 14px;
        border-bottom: 1px solid ${isDarkMode ? '#374151' : '#eee'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${isDarkMode ? '#F9FAFB' : 'inherit'};
        `,
      Table: `
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid ${isDarkMode ? '#374151' : '#eee'};
        background-color: ${isDarkMode ? '#1F2937' : 'white'};
        `,
    },
  ]);

  const onSelectChange = (action: any, state: any) => {
    console.log('Selection changed:', action, state);
  };

  const select = enableSelect
    ? useRowSelect(tableData, { onChange: onSelectChange })
    : undefined;

  const columnsWithSelect = enableSelect
    ? [{ label: '', select: true }, ...columns]
    : columns;

  return (
    <div className='w-full'>
      <CompactTable
        columns={columnsWithSelect}
        data={tableData}
        theme={tableTheme}
        layout={enableSelect ? { custom: true } : undefined}
        select={select}
      />
    </div>
  );
}
