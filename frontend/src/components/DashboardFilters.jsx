import { useState } from 'react';
import { Calendar, Store } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function DashboardFilters({ onFilterChange }) {
    const { isDark } = useTheme();
    const [period, setPeriod] = useState('month');
    const [store, setStore] = useState('all');

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const activeColor = '#8b5cf6';

    const periods = [
        { value: 'today', label: 'Hoje' },
        { value: 'week', label: 'Semana' },
        { value: 'month', label: 'Mês' },
        { value: 'year', label: 'Ano' },
        { value: 'custom', label: 'Personalizado' }
    ];

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        if (onFilterChange) {
            onFilterChange({ period: newPeriod, store });
        }
    };

    const handleStoreChange = (newStore) => {
        setStore(newStore);
        if (onFilterChange) {
            onFilterChange({ period, store: newStore });
        }
    };

    return (
        <div style={{
            backgroundColor: bgColor,
            borderBottom: `1px solid ${borderColor}`,
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
        }}>
            {/* Period Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color={textPrimary} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: textPrimary }}>Período:</span>
                <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: isDark ? '#0f172a' : '#f9fafb', padding: '3px', borderRadius: '6px' }}>
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => handlePeriodChange(p.value)}
                            style={{
                                padding: '4px 10px',
                                backgroundColor: period === p.value ? activeColor : 'transparent',
                                color: period === p.value ? '#ffffff' : textPrimary,
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: period === p.value ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Store Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store size={16} color={textPrimary} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: textPrimary }}>Loja:</span>
                <select
                    value={store}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    style={{
                        width: '150px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: `1px solid ${borderColor}`,
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        color: textPrimary,
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option value="all">Todas</option>
                    <option value="1">Loja Principal</option>
                    <option value="2" disabled>Filial 1 (em breve)</option>
                </select>
            </div>
        </div>
    );
}

export default DashboardFilters;
