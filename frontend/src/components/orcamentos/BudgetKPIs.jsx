import { memo, useMemo } from 'react';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import './BudgetKPIs.css';

const BudgetKPIs = memo(function BudgetKPIs({ kpis, loading }) {
    const kpiCards = useMemo(() => [
        {
            id: 'total',
            label: 'Total de Orçamentos',
            value: kpis?.total || 0,
            icon: FileText,
            color: '#6366f1',
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        },
        {
            id: 'pendentes',
            label: 'Pendentes',
            value: kpis?.pendentes || 0,
            icon: Clock,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
        },
        {
            id: 'aprovados',
            label: 'Aprovados',
            value: kpis?.aprovados || 0,
            icon: CheckCircle,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
        },
        {
            id: 'valorPendente',
            label: 'Valor Pendente',
            value: formatCurrency(kpis?.valorPendente || 0),
            icon: DollarSign,
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            isCurrency: true
        }
    ], [kpis]);

    if (loading) {
        return (
            <div className="budget-kpis">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="budget-kpi-card skeleton">
                        <div className="kpi-skeleton-icon"></div>
                        <div className="kpi-skeleton-content">
                            <div className="kpi-skeleton-label"></div>
                            <div className="kpi-skeleton-value"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="budget-kpis">
            {kpiCards.map(kpi => {
                const Icon = kpi.icon;
                return (
                    <div key={kpi.id} className="budget-kpi-card">
                        <div
                            className="kpi-icon-wrapper"
                            style={{ background: kpi.gradient }}
                        >
                            <Icon size={22} color="white" />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">{kpi.label}</span>
                            <span className={`kpi-value ${kpi.isCurrency ? 'currency' : ''}`}>
                                {kpi.value}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

export default BudgetKPIs;
