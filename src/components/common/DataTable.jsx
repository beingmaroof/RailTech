import { useState } from 'react';
import { IconSearch } from '../icons/Icons.jsx';

// DataTable — sortable, paginated table
export function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No records found.',
  pageSize = 15,
  className = '',
}) {
  const [page, setPage] = useState(1);
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const slice = data.slice(start, start + pageSize);

  return (
    <div className={`rt-card overflow-hidden ${className}`}>
      <div className="rt-timeline-scroll">
        <table className="rt-table rt-table-clickable" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ width: col.width }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-400">{emptyMessage}</td>
              </tr>
            ) : (
              slice.map((row, i) => (
                <tr
                  key={row.id || i}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>Showing {start + 1}–{Math.min(start + pageSize, total)} of {total}</span>
          <div className="flex gap-1">
            <button
              className="rt-btn rt-btn-secondary rt-btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >Prev</button>
            <button
              className="rt-btn rt-btn-secondary rt-btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// SearchInput
export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <IconSearch size={14} />
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="rt-input pl-8"
        aria-label={placeholder}
      />
    </div>
  );
}

// FilterBar
export function FilterBar({ filters, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map(f => (
        <div key={f.key} className="min-w-[140px]">
          <select
            value={f.value}
            onChange={e => onChange(f.key, e.target.value)}
            className="rt-input"
            aria-label={f.label}
          >
            <option value="">{f.label}</option>
            {f.options.map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
