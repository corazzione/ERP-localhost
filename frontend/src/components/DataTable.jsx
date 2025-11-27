import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function DataTable({
    columns,
    data,
    onRowClick,
    selectedRows = [],
    onSelectRows,
    loading = false,
    emptyMessage = 'Nenhum dado encontrado',
    striped = true,
    hoverable = true
}) {
    const { isDark } = useTheme();
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#cbd5e1' : '#6b7280';
    const hoverBg = isDark ? '#334155' : '#f9fafb';
    const stripedBg = isDark ? '#1e293b' : '#f9fafb';

    const handleSort = (column) => {
        if (!column.sortable) return;

        if (sortColumn === column.key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column.key);
            setSortDirection('asc');
        }
    };

    const sortedData = sortColumn
        ? [...data].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            const modifier = sortDirection === 'asc' ? 1 : -1;
            return aVal > bVal ? modifier : -modifier;
        })
        : data;

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const isRowSelected = (row) => {
        return selectedRows.some(r => r.id === row.id);
    };

    const toggleRowSelection = (row) => {
        if (!onSelectRows) return;

        if (isRowSelected(row)) {
            onSelectRows(selectedRows.filter(r => r.id !== row.id));
        } else {
            onSelectRows([...selectedRows, row]);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: textSecondary }}>
                Carregando...
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: textSecondary }}>
                {emptyMessage}
            </div>
        );
    }

    return (
        <div>
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: bgColor }}>
                    <thead>
                        <tr style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderBottom: `2px solid ${borderColor}` }}>
                            {onSelectRows && (
                                <th style={{ padding: '12px', width: '40px', textAlign: 'left' }}>
                                    <input type="checkbox" />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => handleSort(column)}
                                    style={{
                                        padding: '12px 16px',
                                        textAlign: column.align || 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: textSecondary,
                                        cursor: column.sortable ? 'pointer' : 'default',
                                        userSelect: 'none'
                                    }}
                                >
                                    {column.label}
                                    {column.sortable && sortColumn === column.key && (
                                        <span style={{ marginLeft: '4px' }}>
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                onClick={() => onRowClick && onRowClick(row)}
                                style={{
                                    borderBottom: `1px solid ${borderColor}`,
                                    backgroundColor: striped && rowIndex % 2 === 1 ? stripedBg : bgColor,
                                    cursor: onRowClick ? 'pointer' : 'default',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (hoverable) {
                                        e.currentTarget.style.backgroundColor = hoverBg;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (hoverable) {
                                        e.currentTarget.style.backgroundColor = striped && rowIndex % 2 === 1 ? stripedBg : bgColor;
                                    }
                                }}
                            >
                                {onSelectRows && (
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="checkbox"
                                            checked={isRowSelected(row)}
                                            onChange={() => toggleRowSelection(row)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                )}
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        style={{
                                            padding: '12px 16px',
                                            fontSize: '14px',
                                            color: textPrimary,
                                            textAlign: column.align || 'left'
                                        }}
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem',
                    padding: '0 0.5rem'
                }}>
                    <div style={{ fontSize: '14px', color: textSecondary }}>
                        Mostrando {((currentPage - 1) * rowsPerPage) + 1} a {Math.min(currentPage * rowsPerPage, sortedData.length)} de {sortedData.length} itens
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="btn btn-outline"
                            style={{ padding: '0.5rem' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={currentPage === i + 1 ? 'btn btn-primary' : 'btn btn-outline'}
                                style={{ padding: '0.5rem 0.75rem', minWidth: '40px' }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="btn btn-outline"
                            style={{ padding: '0.5rem' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
