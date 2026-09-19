import React from 'react';

/**
 * Reusable Government-style Data Table Component
 * Features: Light gray header (#F3F4F6), 16px rounded border, soft borders (#E5E7EB),
 * equal row height, bold medicine names, green clickable IDs, status pills, and 100% fluid responsive layout (no horizontal sliding).
 */
export const DataTable = ({
  columns = [],
  data = [],
  emptyMessage = 'No records found.',
  keyField = 'id',
  onRowClick,
  className = ''
}) => {
  return (
    <div
      className={`table-responsive ${className}`}
      style={{
        width: '100%',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #E5E7EB)',
        backgroundColor: 'var(--bg-card, #FFFFFF)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}
    >
      <table
        className="data-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.8125rem',
          tableLayout: 'auto'
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--table-header-bg, #F3F4F6)',
              borderBottom: '1px solid var(--border-color, #E5E7EB)'
            }}
          >
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '0.75rem 0.875rem',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: 'var(--text-dim, #64748B)',
                  textAlign: col.align || 'left',
                  width: col.width || 'auto',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-dim, #64748B)',
                  fontSize: '0.875rem'
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  borderBottom: '1px solid var(--border-color, #E5E7EB)',
                  backgroundColor: 'var(--bg-card, #FFFFFF)',
                  transition: 'background-color 0.15s ease',
                  cursor: onRowClick ? 'pointer' : 'default'
                }}
              >
                {columns.map((col, colIdx) => {
                  const cellValue = row[col.key];
                  return (
                    <td
                      key={col.key || colIdx}
                      style={{
                        padding: '0.75rem 0.875rem',
                        color: 'var(--text-main, #0F172A)',
                        textAlign: col.align || 'left',
                        verticalAlign: 'middle',
                        fontSize: '0.8125rem',
                        wordBreak: 'break-word'
                      }}
                    >
                      {col.render ? col.render(cellValue, row, rowIdx) : (cellValue ?? '-')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
