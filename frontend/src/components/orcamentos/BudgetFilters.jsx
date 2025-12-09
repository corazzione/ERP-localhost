import { memo, useCallback, useMemo } from 'react';
import { Search, Filter, Store } from 'lucide-react';
import './BudgetFilters.css';

const STATUS_TABS = [
    { value: 'todos', label: 'Todos', color: '#6b7280' },
    { value: 'pendente', label: 'Pendentes', color: '#f59e0b' },
    { value: 'aprovado', label: 'Aprovados', color: '#10b981' },
    { value: 'recusado', label: 'Recusados', color: '#ef4444' },
    { value: 'vencido', label: 'Vencidos', color: '#6b7280' },
    { value: 'convertido', label: 'Convertidos', color: '#8b5cf6' }
];

const BudgetFilters = memo(function BudgetFilters({
    statusFilter,
    onStatusChange,
    searchQuery,
    onSearchChange,
    selectedLojaId,
    onLojaChange,
    lojas = [],
    statusCounts = {}
}) {
    const handleStatusChange = useCallback((status) => {
        onStatusChange(status);
    }, [onStatusChange]);

    const handleLojaChange = useCallback((e) => {
        onLojaChange(e.target.value);
    }, [onLojaChange]);

    const handleBuscaChange = useCallback((e) => {
        onSearchChange(e.target.value);
    }, [onSearchChange]);

    return (
        <div className="budget-filters">
            {/* Status Tabs */}
            <div className="budget-status-tabs">
                {STATUS_TABS.map(tab => {
                    const count = statusCounts[tab.value] || 0;
                    const isActive = statusFilter === tab.value;

                    return (
                        <button
                            key={tab.value}
                            className={`budget-status-tab ${isActive ? 'active' : ''}`}
                            onClick={() => handleStatusChange(tab.value)}
                            style={{ '--tab-color': tab.color }}
                        >
                            <span className="tab-label">{tab.label}</span>
                            {count > 0 && (
                                <span className="tab-count">{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Search and Filters Row */}
            <div className="budget-filters-row">
                <div className="budget-search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="budget-search-input"
                        placeholder="Buscar por código ou cliente..."
                        value={searchQuery || ''}
                        onChange={handleBuscaChange}
                    />
                </div>

                {lojas.length > 0 && (
                    <div className="budget-loja-filter">
                        <Store size={18} className="filter-icon" />
                        <select
                            className="budget-loja-select"
                            value={selectedLojaId || ''}
                            onChange={handleLojaChange}
                        >
                            <option value="">Todas as Lojas</option>
                            {lojas.map(loja => (
                                <option key={loja.id} value={loja.id}>
                                    {loja.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
});

export default BudgetFilters;
