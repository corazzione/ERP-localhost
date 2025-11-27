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
    const activeColor = '#3b82f6';

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

    return (
        <div style={{
            backgroundColor: bgColor,
            borderBottom: `1px solid ${borderColor}`,
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
        }}>
            {/* Period Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color={textPrimary} />
                <span style={{ fontSize: '14px', fontWeight: '500', color: textPrimary }}>Período:</span>
                <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: isDark ? '#0f172a' : '#f9fafb', padding: '4px', borderRadius: '8px' }}>
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => handlePeriodChange(p.value)}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: period === p.value ? activeColor : 'transparent',
                                color: period === p.value ? '#ffffff' : textPrimary,
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
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

            {/* Store Filter (Placeholder) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store size={18} color={textPrimary} />
                <span style={{ fontSize: '14px', fontWeight: '500', color: textPrimary }}>Loja:</span>
                <select
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    className="input"
                    style={{
                        width: '150px',
                        padding: '6px 12px',
                        fontSize: '13px'
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
