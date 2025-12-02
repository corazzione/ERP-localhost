import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../services/api';
import { useFilters } from '../contexts/FilterContext';
import PremiumKPICard from '../components/PremiumKPICard';
import AppleLineChart from '../components/AppleLineChart';
import DonutMovementChart from '../components/DonutMovementChart';
import IntelligentOverviewCard from '../components/IntelligentOverviewCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);
    const { store, period, customDateRange, lastUpdated } = useFilters();
    const { isDark } = useTheme();

    useEffect(() => {
        loadDashboardData();
    }, [store, period, customDateRange, lastUpdated]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = { period, store };
            if (period === 'custom' && customDateRange.start && customDateRange.end) {
                params.startDate = customDateRange.start.toISOString();
                params.endDate = customDateRange.end.toISOString();
            }

            console.log('🔄 Carregando dashboard com filtros:', params);

            const response = await api.get('/dashboard', { params });

            console.log('✅ Dados do dashboard carregados:', response.data);
            setDashboardData(response.data);
        } catch (error) {
            console.error('❌ Erro ao carregar dashboard:', error);
            setError(error.response?.data?.error || 'Erro ao carregar dados do dashboard');
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const formatTrend = (value) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    };

    // KPI Cards Data
    const kpiCards = [
        {
            title: 'Faturamento',
            value: formatCurrency(dashboardData?.vendas?.faturamento),
            icon: DollarSign,
            trend: dashboardData?.vendas?.comparativo?.faturamento >= 0 ? 'up' : 'down',
            trendValue: formatTrend(dashboardData?.vendas?.comparativo?.faturamento || 0),
            iconColor: '#3b82f6'
        },
        {
            title: 'Ticket Médio',
            value: formatCurrency(dashboardData?.vendas?.ticketMedio),
            icon: ShoppingCart,
            trend: dashboardData?.vendas?.comparativo?.ticketMedio >= 0 ? 'up' : 'down',
            trendValue: formatTrend(dashboardData?.vendas?.comparativo?.ticketMedio || 0),
            iconColor: '#10b981'
        },
        {
            title: 'Nº de Vendas',
            value: String(dashboardData?.vendas?.quantidade || 0),
            icon: CreditCard,
            trend: dashboardData?.vendas?.comparativo?.quantidade >= 0 ? 'up' : 'down',
            trendValue: formatTrend(dashboardData?.vendas?.comparativo?.quantidade || 0),
            iconColor: '#8b5cf6'
        },
        {
            title: 'A Receber',
            value: formatCurrency(dashboardData?.financeiro?.receber30Dias),
            icon: TrendingUp,
            trend: dashboardData?.financeiro?.comparativo?.receber >= 0 ? 'down' : 'up', // Invertido: menos a receber é melhor
            trendValue: formatTrend(dashboardData?.financeiro?.comparativo?.receber || 0),
            iconColor: '#f59e0b'
        },
        {
            title: 'A Pagar',
            value: formatCurrency(dashboardData?.financeiro?.pagar30Dias),
            icon: TrendingDown,
            trend: dashboardData?.financeiro?.comparativo?.pagar >= 0 ? 'up' : 'down',
            trendValue: formatTrend(dashboardData?.financeiro?.comparativo?.pagar || 0),
            iconColor: '#ef4444'
        }
    ];

    const pageBackground = isDark ? '#0f172a' : '#f8fafc';

    return (
        <div style={{
            minHeight: '100vh',
            background: pageBackground,
            padding: '32px',
            transition: 'background 0.3s ease'
        }}>
            {/* KPI Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                {kpiCards.map((card, index) => (
                    <PremiumKPICard key={index} {...card} />
                ))}
            </div>

            {/* Charts Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <AppleLineChart
                    data={dashboardData?.vendas?.porDia || []}
                    title="Faturamento Diário"
                />
                <DonutMovementChart
                    data={dashboardData?.movimentacoes || {
                        entradas: 0,
                        saidas: 0,
                        crediario: 0
                    }}
                />
            </div>

            {/* Intelligent Overview Card */}
            <div style={{ marginBottom: '32px' }}>
                <IntelligentOverviewCard />
            </div>

            {/* Error Display */}
            {error && (
                <div style={{
                    padding: '16px 24px',
                    background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                    borderRadius: '12px',
                    color: '#ef4444',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
